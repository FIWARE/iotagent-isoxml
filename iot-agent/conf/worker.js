const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'WKR';
const ngsiType = 'Person';

/*
A WorkerId
B WorkerLastName
C WorkerFirstName
D WorkerStreet
E WorkerPOBox
F WorkerPostalCode
G WorkerCity
H WorkerState
I WorkerCountry
J WorkerPhone
K WorkerMobile
L WorkerLicenseNumber
M WorkerEmail
*/

/**
 * This function maps an NGSI object to an ISOXML WKR
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'familyName');
    FMIS.addAttribute(attr, entity, 'C', 'givenName');
    FMIS.addAddressAttribute(attr, entity, 'D', 'address');
    FMIS.addAttribute(attr, entity, 'J', 'telephone');
    FMIS.addAttribute(attr, entity, 'K', 'mobile');
    FMIS.addAttribute(attr, entity, 'L', 'faxNumber');
    FMIS.addAttribute(attr, entity, 'M', 'eMail');
    return xml;
}

/**
 * This function maps an ISOXML WKR to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'B', 'familyName', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'givenName', schema.TEXT, normalized);
    MICS.addAddressProperty(entity, 'D', 'address', schema.POSTAL_ADDRESS);
    MICS.addProperty(entity, 'J', 'telephone', schema.TEXT, normalized);
    MICS.addProperty(entity, 'K', 'mobile', schema.TEXT, normalized);
    MICS.addProperty(entity, 'L', 'faxNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'M', 'eMail', schema.TEXT, normalized);
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
