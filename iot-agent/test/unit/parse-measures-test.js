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
const xml2js = require('xml2js');
const utils = require('../utils');
const parser = new xml2js.Parser();

describe('ISOXML Parser: measures', function () {
    describe('When a payload with a single ISOXML element is parsed', function () {
        it('should return a single object with attributes', function (done) {
            const input = utils.readXML('./test/isoxml/farm1.xml');
            parser.parseString(input, function (err, xml) {
                const result = isoxmlParser.parse(xml.FRM);
                should.exist(result);
                (typeof result).should.equal('object');
                result.A.should.equal('FRM3');
                done();
            });
        });
    });
    describe('When a payload with an embedded ISOXML element is parsed', function () {
        it('should return a single object with attributes containing arrays', function (done) {
            const input = utils.readXML('./test/isoxml/task_DLT.xml');
            parser.parseString(input, function (err, xml) {
                const result = isoxmlParser.parse(xml.TSK);
                should.exist(result);
                (typeof result).should.equal('object');
                result.A.should.equal('TSK1');
                Array.isArray(result.DLT).should.equal(true);
                result.DLT.length.should.equal(1);
                result.DLT[0].A.should.equal('DFFF');
                done();
            });
        });
    });

    describe('When a payload with multiple embedded ISOXML element is parsed', function () {
        it('should return a single object with attributes containing arrays and embedded arrays', function (done) {
            const input = utils.readXML('./test/isoxml/device.xml');
            parser.parseString(input, function (err, xml) {
                const result = isoxmlParser.parse(xml.DVC);
                should.exist(result);
                (typeof result).should.equal('object');
                result.A.should.equal('DVC1');
                result.B.should.equal('Tiller');
                Array.isArray(result.DET).should.equal(true);
                result.DET.length.should.equal(1);
                Array.isArray(result.DPD).should.equal(true);
                Array.isArray(result.DVP).should.equal(true);
                result.DPD.length.should.equal(5);
                result.DVP.length.should.equal(3);
                done();
            });
        });
    });

    /*
    describe('When a payload with multiple embedded ISOXML element is parsed', function() {
        it('should return a single object with attributes containing arrays and embedded arrays', function(done) {
            const input = utils.readXML('./test/isoxml/device.xml');
            parser.parseString(input, function(err, xml) {
                const result = isoxmlParser.parse(xml.DVC);
                console.error(JSON.stringify(result, null, 4));
                done();
            });
        });
    });*/
});
