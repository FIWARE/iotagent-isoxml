const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'DLT';
const ngsiType = 'DataLogTrigger';

/*
A DataLogDDI
B DataLogMethod
C DataLogDistanceInterval
D DataLogTimeInterval
E DataLogThresholdMinimum
F DataLogThresholdMaximum
G DataLogThresholdChange
H DeviceElementIdRef
I ValuePresentationIdRef
J DataLogPGN
K DataLogPGNStartBit
L DataLogPGNStopBit
*/

/**
 * This function maps an NSGI Object to ISOXML DLT
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'ddi');
    FMIS.addAttribute(attr, entity, 'B', 'method');
    FMIS.addAttribute(attr, entity, 'C', 'distanceInterval');
    FMIS.addAttribute(attr, entity, 'D', 'timeInterval');
    FMIS.addAttribute(attr, entity, 'E', 'thresholdMinimum');
    FMIS.addAttribute(attr, entity, 'F', 'thresholdMaximum');
    FMIS.addAttribute(attr, entity, 'G', 'thresholdChange');
    FMIS.addRelationship(attr, entity, 'H', 'deviceElementId', 'Device');
    FMIS.addRelationship(attr, entity, 'I', 'valuePresentationId', 'Value');
    FMIS.addAttribute(attr, entity, 'J', 'PGN');
    FMIS.addAttribute(attr, entity, 'K', 'PGNStartBit');
    FMIS.addAttribute(attr, entity, 'L', 'PGNStopBit');
    return xml;
}

/**
 * This function maps an ISOXML DLT to an NSGI Object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'ddi', schema.TEXT, normalized);
    MICS.addInt(entity, 'B', 'method', schema.NUMBER, normalized);
    MICS.addInt(entity, 'C', 'distanceInterval', schema.NUMBER, normalized);
    MICS.addInt(entity, 'D', 'timeInterval', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'E', 'thresholdMinimum', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'F', 'thresholdMaximum', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'G', 'thresholdChange', schema.NUMBER, normalized);
    MICS.addRelationship(entity, 'H', 'deviceElementId', 'Device', normalized);
    MICS.addRelationship(entity, 'I', 'valuePresentationId', 'Value', normalized);
    MICS.addInt(entity, 'J', 'PGN', schema.NUMBER, normalized);
    MICS.addInt(entity, 'K', 'PGNStartBit', schema.NUMBER, normalized);
    MICS.addInt(entity, 'L', 'PGNStopBit', schema.NUMBER, normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML DLT
*    Building.owner = I  - CustomerIdRef 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'deviceElementId');
    transforms.addReference(refs, entity, 'valuePresentationId');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
