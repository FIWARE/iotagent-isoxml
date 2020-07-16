const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;
const customer = require('./customer');

const isoxmlType = 'FRM';
const ngsiType = 'Building';

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
 * This function maps a smart-data-models Building to ISOXML FRM
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAddressAttribute(attr, entity, 'C', 'address');
    FMIS.addRelationship(attr, entity, 'I', 'owner', customer.isoxmlType);
    return xml;
}

/**
 * This function maps an ISOXML FRM to a smart-data-models Building
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addAddressProperty(entity, 'C', 'address', schema.POSTAL_ADDRESS, normalized);
    MICS.addRelationship(entity, 'I', 'owner', schema.PERSON, normalized);
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
    relationships,
    isoxmlType,
    ngsiType
};
