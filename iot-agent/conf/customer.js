const transforms = require('../lib/adapters/transforms');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

/*
A CustomerId
B CustomerLastName
C CustomerFirstName
D CustomerStreet
E CustomerPOBox
F CustomerPostalCode
G CustomerCity
H CustomerState
I CustomerCountry
J CustomerPhone
K CustomerMobile
L CustomerFax
M CustomerEMail
*/

/**
 * This function maps a Schema.org Person to an ISOXML CTR
 */
function transformFMIS(entity) {
    const xml = { CTR: { _attr: {} } };
    const attr = xml.CTR._attr;
    FMIS.addId(attr, entity, 'CTR');
    FMIS.addAttribute(attr, entity, 'B', 'familyName');
    FMIS.addAttribute(attr, entity, 'C', 'givenName');
    FMIS.addAddressAttribute(attr, entity, 'D', 'address');
    FMIS.addAttribute(attr, entity, 'J', 'telephone');
    FMIS.addAttribute(attr, entity, 'K', 'mobile');
    FMIS.addAttribute(attr, entity, 'L', 'licenseNumber');
    FMIS.addAttribute(attr, entity, 'M', 'eMail');
    return xml;
}

/**
 * This function maps an ISOXML CTR to a Schema.org Person
 */
function transformMICS(entity) {
    MICS.addProperty(entity, 'B', 'familyName', 'Text');
    MICS.addProperty(entity, 'C', 'givenName', 'Text');
    MICS.addAddressProperty(entity, 'D', 'address', 'PostalAddress');
    MICS.addProperty(entity, 'J', 'telephone', 'Text');
    MICS.addProperty(entity, 'K', 'mobile', 'Text');
    MICS.addProperty(entity, 'L', 'licenseNumber', 'Text');
    MICS.addProperty(entity, 'M', 'eMail', 'Text');
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS
};
