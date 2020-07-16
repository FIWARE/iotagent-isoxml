const transforms = require('../lib/adapters/transforms');
const FMIS = transforms.FMIS;

const isoxmlType = 'GAN';
const ngsiType = 'GuidanceAllocation';

/*
A GuidanceGroupIdRef
*/

/**
 * This function maps an NGSI object to an ISOXML GAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);

    return xml;
}

/**
 * This function maps an ISOXML GAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
