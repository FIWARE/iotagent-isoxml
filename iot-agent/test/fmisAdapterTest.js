

const fmisAdapter = require('../conf/fmisAdapter')
const utils = require('./utils');
const should = require('should');


describe('FMIS ADAPTER', function() {
    describe('When an NGSI Building model of isoxml_type=FRM', function() {
        
        it('should be converted to an isoxml <FRM> with all attributes', function(done) {
	        const ngsiInput = utils.readJSON('./test/cbKeyValues/farm1.json');
	        const isoxmlOutput = utils.readXML('./test/isoxml/farm1.xml');
        	const xmlObject = fmisAdapter.frm(ngsiInput);
        	const xml = utils.convertToXML(xmlObject);
        	should(xml).be.exactly(isoxmlOutput);
            done();
        });


        it('should be converted to an isoxml <FRM> with missing elements excluded from the payload', function(done) {
	        const ngsiInput = utils.readJSON('./test/cbKeyValues/farm2.json');
	        const isoxmlOutput = utils.readXML('./test/isoxml/farm2.xml');
        	const xmlObject = fmisAdapter.frm(ngsiInput);
        	const xml = utils.convertToXML(xmlObject);
        	should(xml).be.exactly(isoxmlOutput);
            done();
        });

        it('should generate valid isoxml ID for the <FRM> if it is missing', function(done) {
	        const ngsiInput = utils.readJSON('./test/cbKeyValues/farm3.json');
	        const isoxmlOutput = utils.readXML('./test/isoxml/farm3.xml');
        	
	        fmisAdapter.resetIndex();
	        fmisAdapter.frm(ngsiInput);

        	const xmlObject = fmisAdapter.frm(ngsiInput);
        	const xml = utils.convertToXML(xmlObject);
        	should(xml).be.exactly(isoxmlOutput);
            done();
        });
    });
 });