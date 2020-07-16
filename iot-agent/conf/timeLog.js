const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'TLG';
const ngsiType = 'TimeLog';

/*
A Filename
B Filelength
C TimeLogType
*/

/**
 * This function maps an NGSI object to an ISOXML TLG
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'filename');
    FMIS.addAttribute(attr, entity, 'B', 'fileLength');
    FMIS.addAttribute(attr, entity, 'C', 'timeLogType');
    return xml;
}

/**
 * This function maps an ISOXML TLG to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'filename', schema.TEXT, normalized);
    MICS.addInt(entity, 'B', 'fileLength', schema.NUMBER, normalized);
    MICS.addProperty(entity, 'C', 'timeLogType', schema.TEXT, normalized);
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
