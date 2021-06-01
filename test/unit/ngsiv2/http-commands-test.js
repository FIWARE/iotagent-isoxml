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

const iotagentISOXML = require('../../../lib/iotagent-isoxml');
const config = require('./config.js');
const nock = require('nock');
const should = require('should');
const iotAgentLib = require('iotagent-node-lib');
const async = require('async');
const request = require('request');
const utils = require('../../utils');
let mockedClientServer;
let contextBrokerMock;

describe('HTTP: Commands', function () {
    beforeEach(function (done) {
        const provisionOptions = {
            url: 'http://localhost:' + config.iota.server.port + '/iot/services',
            method: 'POST',
            json: utils.readJSON('./test/unit/ngsiv2/groupProvisioning/provisionISOXML.json'),
            headers: {
                'fiware-service': 'smartgondor',
                'fiware-servicepath': '/gardens'
            }
        };

        const provisionFarm = {
            url: 'http://localhost:' + config.http.port + '/iot/isoxml',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: utils.readISOXML('./test/isoxml/farmAndCustomers.xml')
        };
        nock.cleanAll();

        contextBrokerMock = nock('http://192.168.1.1:1026')
            .matchHeader('fiware-service', 'smartgondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post('/v2/registrations')
            .reply(201, null, { Location: '/v2/registrations/6319a7f5254b05844116584d' });

        contextBrokerMock
            .matchHeader('fiware-service', 'smartgondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post(
                '/v2/entities/urn:ngsi-ld:Building:FRM3/attrs',
                utils.readJSON('./test/unit/ngsiv2/contextRequests/farm1.json')
            )
            .query({ type: 'Building' })
            .reply(204);
        contextBrokerMock
            .matchHeader('fiware-service', 'smartgondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post(
                '/v2/entities/urn:ngsi-ld:Person:CTR1/attrs',
                utils.readJSON('./test/unit/ngsiv2/contextRequests/customer1.json')
            )
            .query({ type: 'Person' })
            .reply(204);
        contextBrokerMock
            .matchHeader('fiware-service', 'smartgondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post(
                '/v2/entities/urn:ngsi-ld:Person:CTR2/attrs',
                utils.readJSON('./test/unit/ngsiv2/contextRequests/customer2.json')
            )
            .query({ type: 'Person' })
            .reply(204);

        contextBrokerMock
            .matchHeader('fiware-service', 'smartgondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post('/v2/entities?options=upsert')
            .thrice()
            .reply(204);

        iotagentISOXML.start(config, function () {
            request(provisionOptions, function (error1, response1, body1) {
                request(provisionFarm, function (error2, response2, body2) {
                    done();
                });
            });
        });
    });

    afterEach(function (done) {
        nock.cleanAll();
        async.series([iotAgentLib.clearAll, iotagentISOXML.stop], done);
    });

    describe('When a command arrive to the Agent for a single isoxml element with the HTTP protocol', function () {
        const commandOptions = {
            url: 'http://localhost:' + config.iota.server.port + '/v2/op/update',
            method: 'POST',
            json: utils.readJSON('./test/unit/ngsiv2/contextRequests/updateCommand1.json'),
            headers: {
                'fiware-service': 'smartgondor',
                'fiware-servicepath': '/gardens'
            }
        };

        beforeEach(function () {
            contextBrokerMock
                .matchHeader('fiware-service', 'smartgondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .get('/v2/entities/urn:ngsi-ld:Building:FRM3?options=keyValues')
                .reply(200, utils.readJSON('./test/cbKeyValues/farm1.json'));
            contextBrokerMock
                .matchHeader('fiware-service', 'smartgondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .get('/v2/entities/urn:ngsi-ld:Person:CTR2?options=keyValues')
                .reply(200, utils.readJSON('./test/cbKeyValues/customer2.json'));

            contextBrokerMock
                .matchHeader('fiware-service', 'smartgondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post(
                    '/v2/entities/urn:ngsi-ld:Building:FRM3/attrs?type=Building',
                    utils.readJSON('./test/unit/ngsiv2/contextRequests/updateFarmStatusPending.json')
                )
                .reply(204);

            contextBrokerMock
                .matchHeader('fiware-service', 'smartgondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post(
                    '/v2/entities/urn:ngsi-ld:Building:FRM3/attrs?type=Building',
                    utils.readJSON('./test/unit/ngsiv2/contextRequests/updateFarmStatusSuccess.json')
                )
                .reply(204);

            mockedClientServer = nock('http://mics')
                .post(
                    '/iot/isoxml',
                    '<isoxml><FRM A="FRM3" B="Animal Farm" C="Street2" D="PO Box2" E="PostalCode2" F="City2" G="State2" H="Country2" I="CTR2"/><CTR A="CTR2" B="Napoleon the Pig"/></isoxml>'
                )
                .reply(200);
        });

        it('should return a 204 OK without errors', function (done) {
            request(commandOptions, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(204);
                done();
            });
        });
        it('should update the status in the Context Broker', function (done) {
            request(commandOptions, function (error, response, body) {
                setTimeout(function () {
                    contextBrokerMock.done();
                    done();
                }, 100);
            });
        });
        it('should send an update to the ISOXML client', function (done) {
            request(commandOptions, function (error, response, body) {
                setTimeout(function () {
                    mockedClientServer.done();
                    done();
                }, 100);
            });
        });
    });
});
