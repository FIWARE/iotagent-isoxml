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
            const entity = MICS.frm(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });

    describe('When a simple <TSK> isoxml element is processed', function() {
        it('should be converted into a CB Activity with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/task_DLT.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/task_DLT.json');
            const entity = MICS.tsk(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });

    describe('When a complex <TSK> isoxml element is processed', function() {
        it('should be converted into a CB Activity with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/task_Complex.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/task_Complex.json');
            const entity = MICS.tsk(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });

    describe('When a <TSK> isoxml element including <ASP> and <PTN> data is processed', function() {
        it('should be converted into a CB Activity with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/task_PAN.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/task_PAN.json');
            const entity = MICS.tsk(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });
    describe('When a <TSK> isoxml element including <GAN> and <GST> data is processed', function() {
        it('should be converted into a CB Activity with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/task_GAN.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/task_GAN.json');
            const entity = MICS.tsk(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });
    describe('When a <TSK> isoxml element including <TIM> and <DLV> data is processed', function() {
        it('should be converted into a CB Activity with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/task_TIM.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/task_TIM.json');
            const entity = MICS.tsk(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });
    describe('When a <TSK> isoxml element including <TZN> and <PLN> data is processed', function() {
        it('should be converted into a CB Activity with all attributes', function(done) {
            const input = utils.readJSON('./test/iotagentPayload/task_TZN.json');
            const cbEntity = utils.readJSON('./test/cbNgsiV2/task_TZN.json');
            const entity = MICS.tsk(input, true);
            attributeDelete.update(entity, null, function(err, entity) {
                should(JSON.stringify(entity)).equal(JSON.stringify(cbEntity));
                done();
            });
        });
    });
});
