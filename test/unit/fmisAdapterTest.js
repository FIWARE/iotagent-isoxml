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

const FMIS = require('../../lib/adapters/adapter').FMIS;
const utils = require('../utils');
const should = require('should');

describe('FMIS ADAPTER', function () {
    describe('When an NGSI Building model of isoxml_type=FRM', function () {
        it('should be converted to an isoxml <FRM> with all attributes', function (done) {
            const ngsiInput = utils.readJSON('./test/cbKeyValues/farm1.json');
            const isoxmlOutput = utils.readXML('./test/isoxml/farm1.xml');
            const xmlObject = FMIS.frm(ngsiInput);
            const xml = utils.convertToXML(xmlObject);
            should(xml).be.exactly(isoxmlOutput);
            done();
        });

        it('should be converted to an isoxml <FRM> with missing elements excluded from the payload', function (done) {
            const ngsiInput = utils.readJSON('./test/cbKeyValues/farm2.json');
            const isoxmlOutput = utils.readXML('./test/isoxml/farm2.xml');
            const xmlObject = FMIS.frm(ngsiInput);
            const xml = utils.convertToXML(xmlObject);
            should(xml).be.exactly(isoxmlOutput);
            done();
        });

        it('should generate valid isoxml ID for the <FRM> if it is missing', function (done) {
            const ngsiInput = utils.readJSON('./test/cbKeyValues/farm3.json');
            const isoxmlOutput = utils.readXML('./test/isoxml/farm3.xml');

            FMIS.resetIndex();
            FMIS.frm(ngsiInput);

            const xmlObject = FMIS.frm(ngsiInput);
            const xml = utils.convertToXML(xmlObject);
            should(xml).be.exactly(isoxmlOutput);
            done();
        });
    });
});
