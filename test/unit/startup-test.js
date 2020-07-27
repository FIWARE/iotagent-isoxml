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

const config = require('../../lib/configService');
const iotAgentConfig = require('../config-test.js');
const fs = require('fs');
const sinon = require('sinon');

describe('Startup tests', function () {
    describe('When the HTTP transport is started with environment variables', function () {
        beforeEach(function () {
            sinon.stub(fs, 'statSync');
            process.env.IOTA_HTTP_HOST = 'localhost';
            process.env.IOTA_HTTP_PORT = '2222';
            process.env.IOTA_HTTP_TIMEOUT = '5';
            process.env.IOTA_HTTP_KEY = '/http/bbb/key.pem';
            process.env.IOTA_HTTP_CERT = '/http/bbb/cert.pem';
        });

        afterEach(function () {
            fs.statSync.restore();
            delete process.env.IOTA_HTTP_HOST;
            delete process.env.IOTA_HTTP_PORT;
            delete process.env.IOTA_HTTP_TIMEOUT;
            delete process.env.IOTA_HTTP_KEY;
            delete process.env.IOTA_HTTP_CERT;
        });

        it('should load the HTTP environment variables in the internal configuration', function (done) {
            config.setConfig(iotAgentConfig);
            config.getConfig().http.host.should.equal('localhost');
            config.getConfig().http.port.should.equal('2222');
            config.getConfig().http.timeout.should.equal('5');
            config.getConfig().http.key.should.equal('/http/bbb/key.pem');
            config.getConfig().http.cert.should.equal('/http/bbb/cert.pem');
            done();
        });
    });
});
