const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;
const worker = require('./worker');

const isoxmlType = 'WAN';
const ngsiType = 'WorkerAllocation';

/*
A WorkerIdRef

AllocationStamp
*/

/**
 * This function maps an NGSI object to an ISOXML WAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'workerIdRef', worker.isoxmlType);
    return xml;
}

/**
 * This function maps an ISOXML WAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'workerIdRef', schema.PERSON, normalized);
    MICS.addTimestamp(entity, 'ASP', normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML FRM
*    Building.owner = I  - CustomerIdRef 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'workerIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
