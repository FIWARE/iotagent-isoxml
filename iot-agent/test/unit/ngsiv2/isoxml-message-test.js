/*
 * Copyright 2020 FIWARE Foundation e.V.
 *
 * This file is part of iotagent-isoxml
 *
 * iotagent-isoxml is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-isoxml is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-isoxml.
 * If not, see http://www.gnu.org/licenses/.
 *
 */

/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */

const iotagentISOXML = require('../../../lib/iotagent-isoxml');
const config = require('./config-anon.js');
const nock = require('nock');
const iotAgentLib = require('iotagent-node-lib');
const should = require('should');
const async = require('async');
const request = require('request');
const utils = require('../../utils');
let contextBrokerUnprovMock;
let contextBrokerMock;

function addMock(id, type, payload, code = 204) {
    if (payload) {
        const json = utils.readJSON('./test/unit/ngsiv2/contextRequests/' + payload);
        contextBrokerMock
            .matchHeader('fiware-service', 'isoxml')
            .matchHeader('fiware-servicepath', '/')
            .post('/v2/entities/urn:ngsi-ld:' + type + ':' + id + '/attrs', json)
            .query({ type })
            .reply(code);
    } else {
        contextBrokerMock
            .matchHeader('fiware-service', 'isoxml')
            .matchHeader('fiware-servicepath', '/')
            .post('/v2/entities/urn:ngsi-ld:' + type + ':' + id + '/attrs')
            .query({ type })
            .reply(code);
    }
}

describe('ISOXML measures', function () {
    beforeEach(function (done) {
        contextBrokerMock = nock('http://192.168.1.1:1026')
            .matchHeader('fiware-service', 'isoxml')
            .matchHeader('fiware-servicepath', '/')
            .post('/v2/entities?options=upsert')
            .reply(204);

        iotagentISOXML.start(config, function () {
            done();
        });
    });

    afterEach(function (done) {
        nock.cleanAll();
        async.series([iotAgentLib.clearAll, iotagentISOXML.stop], done);
    });

    describe('When a single isoxml <FRM> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/farm1.xml')
        };

        beforeEach(function () {
            addMock('FRM3', 'Building', 'singleFarmMeasure.json');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a single isoxml <DVC> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/device.xml')
        };

        beforeEach(function () {
            addMock('DVC1', 'Device', 'device1.json');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a single <TSK> with <PGP>. <PDT> and <VPN> elements arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/task_PDT.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026')
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .times(5)
                .reply(204);

            addMock('TSK11', 'Activity', 'task_PDT.json');
            addMock('PGP1', 'ProductGroup', 'productGroup1.json');
            addMock('PDT1', 'Product', 'product1.json');
            addMock('PGP2', 'ProductGroup');
            addMock('PDT2', 'Product');
            addMock('VPN1', 'Value', 'valuePresentation1.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with multiple entities', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a <FRM> and <CTR> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/farmAndCustomers.xml')
        };

        beforeEach(function () {
            contextBrokerMock
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .twice()
                .reply(204);

            addMock('FRM3', 'Building', 'singleFarmMeasure.json');
            addMock('CTR1', 'Person', 'singleCustomerMeasure3.json');
            addMock('CTR2', 'Person', 'singleCustomerMeasure4.json');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send multiple update context requests to the Context Broker', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a two <CCT> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/codedComment.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026')
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .times(1)
                .reply(204);

            addMock('CCT1', 'CodedComment', 'codedComment1.json');
            addMock('CCT2', 'CodedComment', 'codedComment2.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with two entities', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
    describe('When a single <CCT> with embeded <CCL> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/codedComment_CCL.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026');

            addMock('CCT3', 'CodedComment', 'codedComment3.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with a single entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
    describe('When multiple <CPT> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/cropType_CVT.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026')
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .times(2)
                .reply(204);


            addMock('CTP1', 'CropType', 'cropType1.json');
            addMock('CTP2', 'CropType', 'cropType2.json');
            addMock('CTP3', 'CropType', 'cropType3.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with multiple entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a <CPT> referencing a <PGP> arrives , via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/cropType_PGP.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026')
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .times(1)
                .reply(204);


            addMock('CTP4', 'CropType', 'cropType4.json');
            addMock('PGP1', 'ProductGroup', 'productGroup2.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with entities', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a single <CLD> with embeded <CRG> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/colourLegend.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026');

            addMock('CLD1', 'ColourLegend', 'colourLegend1.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with a single entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });


    describe('When a single <BSN> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/baseStation.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026');
            addMock('BSN4', 'BaseStation', 'baseStation1.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with an single entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });


    describe('When multiple <CPC> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/culturalPractice.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026')
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .times(2)
                .reply(204);


            addMock('CPC1', 'CulturalPractice', 'culturalPractice1.json');
            addMock('CPC2', 'CulturalPractice', 'CulturalPractice2.json');
            addMock('CPC3', 'CulturalPractice', 'culturalPractice3.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with multiple entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });


    describe('When multiple <OTQ> elements arrive, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/operationTechnique.xml')
        };

        beforeEach(function () {
            contextBrokerMock = nock('http://192.168.1.1:1026')
                .matchHeader('fiware-service', 'isoxml')
                .matchHeader('fiware-servicepath', '/')
                .post('/v2/entities?options=upsert')
                .times(2)
                .reply(204);


            addMock('OTQ1', 'OperationTechnique', 'operationTechnique1.json');
            addMock('OTQ2', 'OperationTechnique', 'operationTechnique2.json');
            addMock('OTQ3', 'OperationTechnique', 'operationTechnique3.json');
        });

        it('should end up with a 200 OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with multiple entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a single isoxml <PDT> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/product.xml')
        };

        beforeEach(function () {
            addMock('PDT250', 'Product', 'product2.json');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a single isoxml <PFD> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/partField.xml')
        };

        beforeEach(function () {
            addMock('PFD3', 'PartField', 'partField1.json');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });

    describe('When a single isoxml <PFD> containing a <GGP> element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/partField_GGP.xml')
        };

        beforeEach(function () {
            addMock('PFD3', 'PartField', 'partField2.json');
        });

        it('should end up with a 200OK status code', function (done) {
            request(getOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                done();
            });
        });
        it('should send a new update context request to the Context Broker with just that entity', function (done) {
            request(getOptions, function (error, response, body) {
                contextBrokerMock.done();
                done();
            });
        });
    });
});
