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

const MICS = require('../../lib/adapters/adapter').MICS;
const attributeDelete = require('../../lib/plugins/AttributeDeletePlugin');
const utils = require('../utils');
const should = require('should');

describe('MICS ADAPTER', function() {
    describe('When a single <FRM> isoxml element is processed', function() {
        it('should be converted into a CB Building with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/farm1.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/farm1.json');
            const entity = MICS.frm(input);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });
});
