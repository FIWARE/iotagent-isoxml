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
