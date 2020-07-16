const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'DAN';
const ngsiType = 'DeviceAllocation';

/*
A clientNameValue
B clientNameMask
C deviceIdRef
*/

/**
 * This function maps an NGSI object to an ISOXML DAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'clientNameValue');
    FMIS.addAttribute(attr, entity, 'B', 'clientNameMask');
    FMIS.addRelationship(attr, entity, 'C', 'deviceIdRef', 'DVC');
    return xml;
}

/**
 * This function maps an ISOXML DAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'clientNameValue', schema.TEXT, normalized);
    MICS.addProperty(entity, 'B', 'clientNameMask', schema.TEXT, normalized);
    MICS.addRelationship(entity, 'C', 'deviceIdRef', 'Device', normalized);
    MICS.addTimestamp(entity, 'ASP', normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML DAN 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'deviceIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType,
    relationships
};
