const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'TIM';
const ngsiType = 'TimeEvent';

/*
A Start
B Stop
C Duration
D Type
 1 = Planned
 2 = Preliminary
 4 = Effective
 5 = Ineffective
 6 = Repair
 7 = Clearing
 8 = Powered Down

Position
DataLogValue 
*/

const TIME_TYPES = {
    '1': 'Planned',
    '2': 'Preliminary',
    '4': 'Effective',
    '5': 'Ineffective',
    '6': 'Repair',
    '7': 'Clearing',
    '8': 'Powered Down'
};

/**
 * This function maps an NGSI object to an ISOXML TIM
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'startTime');
    FMIS.addAttribute(attr, entity, 'B', 'endTime');
    FMIS.addAttribute(attr, entity, 'C', 'duration');
    FMIS.addAttribute(attr, entity, 'D', 'type');
    return xml;
}

/**
 * This function maps an ISOXML TIM to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'startTime', schema.DATETIME, normalized);
    MICS.addProperty(entity, 'B', 'endTime', schema.DATETIME, normalized);
    MICS.addInt(entity, 'C', 'duration', schema.NUMBER, normalized);
    MICS.addMappedProperty(entity, 'D', 'type', schema.TEXT, TIME_TYPES, normalized);
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
