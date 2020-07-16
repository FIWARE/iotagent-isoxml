const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'CAT';
const ngsiType = 'ControlAssignment';

/*
A SourceClient
B UserClient
C SourceDeviceStructureLabel
D UserDeviceStructureLabel
E SourceDeviceElementNumber
F UserDeviceElementNumber
G ProcessDataDDI
*/

/**
 * This function maps an NGSI object to an ISOXML CAT
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'sourceClient');
    FMIS.addAttribute(attr, entity, 'B', 'userClient');
    FMIS.addAttribute(attr, entity, 'C', 'sourceDeviceStructureLabel');
    FMIS.addAttribute(attr, entity, 'D', 'userDeviceStructureLabel');
    FMIS.addAttribute(attr, entity, 'E', 'sourceDeviceElementNumber');
    FMIS.addAttribute(attr, entity, 'F', 'userDeviceElementNumber');
    FMIS.addAttribute(attr, entity, 'G', 'processDataDDI');

    return xml;
}

/**
 * This function maps an ISOXML CAT to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'sourceClient', schema.TEXT, normalized);
    MICS.addProperty(entity, 'B', 'userClient', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'sourceDeviceStructureLabel', schema.TEXT, normalized);
    MICS.addProperty(entity, 'D', 'userDeviceStructureLabel', schema.TEXT, normalized);
    MICS.addProperty(entity, 'E', 'sourceDeviceElementNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'F', 'userDeviceElementNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'G', 'processDataDDI', schema.TEXT, normalized);
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
