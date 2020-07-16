const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'CAN';
const ngsiType = 'CommentAllocation';

/*
A CommentId
B designator
C scope
D groupRef

AllocationStamp
*/

/**
 * This function maps an NGSI object to an ISOXML CAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'designator');
    FMIS.addAttribute(attr, entity, 'C', 'scope');
    FMIS.addRelationship(attr, entity, 'D', 'groupRef', 'CCT');
    return xml;
}

/**
 * This function maps an ISOXML CAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addProperty(entity, 'B', 'designator', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'scope', schema.TEXT, normalized);
    MICS.addRelationship(entity, 'D', 'groupRef', 'CCT', normalized);
    MICS.addTimestamp(entity, 'ASP', normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML CAN
*    Building.owner = D  - GroupRef 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'groupRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType,
    relationships
};
