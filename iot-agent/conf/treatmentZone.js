const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'TZN';
const ngsiType = 'TreatmentZone';

/*
A TreatmentZoneCode 
B TreatmentZoneDesignator
C TreatmentZoneColour

Polygon
ProcessDataVariable
*/

/**
 * This function maps an NGSI object to an ISOXML TZN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'code');
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'color');
    return xml;
}

/**
 * This function maps an ISOXML TZN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'code', schema.TEXT, normalized);
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'color', schema.TEXT, normalized);
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
