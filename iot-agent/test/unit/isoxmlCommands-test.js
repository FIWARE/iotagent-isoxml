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
const utils = require('../utils');

describe('ISOXML Parser: commands', function() {
    describe('When a command execution with no params and a single entity is parsed', function() {
        it('should extract a single isoxml element', function() {
            const entities = [utils.readJSON('./test/cbKeyValues/farm1.json')];
            const result = isoxmlParser.createCommandPayload(null, null, null, entities);
            result.should.equal('<isoxml>' + utils.readXML('./test/isoxml/farm1.xml') + '</isoxml>')

        });
    });
    describe('When a command execution with no params and a multiple entities is parsed', function() {
        it('should extract multiple isoxml elements', function() {
            const entities = [utils.readJSON('./test/cbKeyValues/farm1.json'),
            utils.readJSON('./test/cbKeyValues/customer1.json'), 
            utils.readJSON('./test/cbKeyValues/customer2.json') ];
            const result = isoxmlParser.createCommandPayload(null, null, null, entities);
            result.should.equal('<isoxml>' + utils.readXML('./test/isoxml/farmAndCustomers.xml') + '</isoxml>')

        });
    });
});
