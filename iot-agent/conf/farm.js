const transforms = require('../lib/adapters/transforms');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;



/*
A FarmId
B FarmDesignator - designator/name
C FarmStreet
D FarmPOBox
E FarmPostalCode
F FarmCity
G FarmState
H FarmCountry
I CustomerIdRef
*/

/**
* This function map a smart-data-models Building to ISOXML FRM
*/
function transformFMIS(entity) {
    const xml = { FRM: { _attr: {} } };
    const attr = xml.FRM._attr;
    FMIS.addId(attr, entity, 'FRM');
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAddressAttribute(attr, entity, 'C', 'address');
    FMIS.addRelationship(attr, entity, 'I', 'owner', 'CTR');
    return xml;
}

/**
* This function map an ISOXML FRM to a smart-data-models Building
*/
function transformMICS(entity) {
    MICS.addProperty(entity, 'B', 'name', 'Text');
    MICS.addAddressProperty(entity, 'C', 'address', 'PostalAddress');
    MICS.addRelationship(entity, 'I', 'owner', 'Person');
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML FRM
*    Building.owner = I  - CustomerIdRef 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'owner');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships
};
