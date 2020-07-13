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
 
const isoxmlParser = require('../../lib/isoxmlParser');
const should = require('should');

describe('ISOXML Parser: commands', function() {
    describe('When a command execution with multiple parameters is parsed', function() {
        it('should extract the deviceId, the command name, and the parameters', function() {
            const result = isoxmlParser.command('weatherStation167@ping|param1=1|param2=2');

            should.exist(result);
            (typeof result).should.equal('object');
            should.exist(result.deviceId);
            result.deviceId.should.equal('weatherStation167');
            should.exist(result.command);
            result.command.should.equal('ping');
            should.exist(result.params);
            should.exist(result.params.param2);
            result.params.param2.should.equal('2');
        });
    });
    xdescribe('When a command execution with no params and a value is parsed', function() {
        it('should extract the deviceId, the command name, and the plain text of the value', function() {
            const result = isoxmlParser.command('weatherStation167@ping|theValue');

            should.exist(result);
            (typeof result).should.equal('object');
            should.exist(result.deviceId);
            result.deviceId.should.equal('weatherStation167');
            should.exist(result.command);
            result.command.should.equal('ping');
            should.exist(result.value);
            result.value.should.equal('theValue');
        });
    });
    xdescribe('When a command result is parsed', function() {
        describe('should extract the deviceId, the command name, and the result', function() {
            it('should extract the deviceId, the command name, and the parameters', function() {
                const result = isoxmlParser.result('weatherStation167@ping|Ping ok');

                should.exist(result);
                (typeof result).should.equal('object');
                should.exist(result.deviceId);
                result.deviceId.should.equal('weatherStation167');
                should.exist(result.command);
                result.command.should.equal('ping');
                should.exist(result.result);
                result.result.should.equal('Ping ok');
            });
        });
    });
});
