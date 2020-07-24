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
const config = require('./config.js');
const nock = require('nock');
const iotAgentLib = require('iotagent-node-lib');
const should = require('should');
const async = require('async');
const request = require('request');
const utils = require('../../utils');
let contextBrokerUnprovMock;
let contextBrokerMock;

describe('Explcitily configured ISOXML measures', function () {
    beforeEach(function (done) {
        const provisionOptions = {
            url: 'http://localhost:' + config.iota.server.port + '/iot/services',
            method: 'POST',
            json: utils.readJSON('./test/unit/ngsiv2/groupProvisioning/provisionISOXML.json'),
            headers: {
                'fiware-service': 'smartGondor',
                'fiware-servicepath': '/gardens'
            }
        };

        nock.cleanAll();

        contextBrokerMock = nock('http://192.168.1.1:1026')
            .matchHeader('fiware-service', 'smartGondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post('/v2/registrations')
            .reply(201, null, { Location: '/v2/registrations/6319a7f5254b05844116584d' });

        contextBrokerMock
            .matchHeader('fiware-service', 'smartGondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post('/v2/entities?options=upsert')
            .reply(204);

        iotagentISOXML.start(config, function () {
            request(provisionOptions, function (error, response, body) {
                done();
            });
        });
    });

    afterEach(function (done) {
        nock.cleanAll();
        async.series([iotAgentLib.clearAll, iotagentISOXML.stop], done);
    });

    describe('When a single isoxml element arrives, via HTTP POST', function () {
        const getOptions = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/farm1.xml')
        };

        beforeEach(function () {
            contextBrokerMock
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post(
                    '/v2/entities/urn:ngsi-ld:Building:FRM3/attrs',
                    utils.readJSON('./test/unit/ngsiv2/contextRequests/singleFarmMeasure.json')
                )
                .query({ type: 'Building' })
                .reply(204);
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

    describe('When multiple isoxml elements arrives, via HTTP POST', function () {
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
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post('/v2/entities?options=upsert')
                .twice()
                .reply(204);

            contextBrokerMock
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post(
                    '/v2/entities/urn:ngsi-ld:Building:FRM3/attrs',
                    utils.readJSON('./test/unit/ngsiv2/contextRequests/singleFarmMeasure.json')
                )
                .query({ type: 'Building' })
                .reply(204);
            contextBrokerMock
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post(
                    '/v2/entities/urn:ngsi-ld:Person:CTR1/attrs',
                    utils.readJSON('./test/unit/ngsiv2/contextRequests/singleCustomerMeasure1.json')
                )
                .query({ type: 'Person' })
                .reply(204);
            contextBrokerMock
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post(
                    '/v2/entities/urn:ngsi-ld:Person:CTR2/attrs',
                    utils.readJSON('./test/unit/ngsiv2/contextRequests/singleCustomerMeasure2.json')
                )
                .query({ type: 'Person' })
                .reply(204);
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
});
