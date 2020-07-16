const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'OTP';
const ngsiType = 'OperTechPractice';

/*
A CulturalPracticeIdRef
B OperationTechniqueIdRef
*/

/**
 * This function maps an NGSI object to an ISOXML OTP
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    return xml;
}

/**
 * This function maps an ISOXML OTP to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'culturalPracticeId', 'CulturalPractice', normalized);
    MICS.addRelationship(entity, 'B', 'operationTechniqueId', 'OperationTechnique', normalized);
    return entity;
}


function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'culturalPracticeId');
    transforms.addReference(refs, entity, 'operationTechniqueId');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
