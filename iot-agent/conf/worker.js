const transforms = require('../lib/adapters/transforms');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

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
* This function map a Schema.org Person to an ISOXML WKR
*/
function transformFMIS(entity) {
    const xml = { WKR: { _attr: {} } };
    const attr = xml.WKR._attr;
    FMIS.addId(attr, entity, 'WKR');
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
* This function map an ISOXML WKR to a Schema.org Person
*/
function transformMICS(entity) {
    MICS.addProperty(entity, 'B', 'familyName', 'Text');
    MICS.addProperty(entity, 'C', 'givenName', 'Text');
    MICS.addAddressProperty(entity, 'D', 'address', 'PostalAddress');
    MICS.addProperty(entity, 'J', 'telephone', 'Text');
    MICS.addProperty(entity, 'K', 'mobile', 'Text');
    MICS.addProperty(entity, 'L', 'faxNumber', 'Text');
    MICS.addProperty(entity, 'M', 'eMail', 'Text');
    return entity;
}



module.exports = {
    transformFMIS,
    transformMICS
};
