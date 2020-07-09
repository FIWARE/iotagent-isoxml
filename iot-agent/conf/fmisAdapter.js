/*
* Farm Management Information system
*/
const fmis = require('./fmisFunctions');

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

function ctr(entity) {
    const xml = { CTR: { _attr: {} } };
    const attr = xml.CTR._attr;
    fmis.addId(attr, entity, 'CTR');
    fmis.addAttribute(attr, entity, 'B', 'familyName');
    fmis.addAttribute(attr, entity, 'C', 'givenName');
    fmis.addAddressAttribute(attr, entity, 'D', 'address');
    fmis.addAttribute(attr, entity, 'J', 'telephone');
    fmis.addAttribute(attr, entity, 'K', 'mobile');
    fmis.addAttribute(attr, entity, 'L', 'licenseNumber');
    fmis.addAttribute(attr, entity, 'M', 'eMail');
    return xml;
}

/*
A FarmId
B FarmDesignator - designator/name
C FarmStreet
D FarmPOBox
E FarmPostalCode
F FarmCity
G FarmState
H FarmCountry
I CustomerIdRef
*/

/* eslint-disable-next-line no-unused-vars */
function frm(entity) {
    const xml = { FRM: { _attr: {} } };
    const attr = xml.FRM._attr;
    fmis.addId(attr, entity, 'FRM');
    fmis.addAttribute(attr, entity, 'B', 'name');
    fmis.addAddressAttribute(attr, entity, 'C', 'address');
    fmis.addRelationship(attr, entity, 'I', 'owner', 'CTR');
    return xml;
}

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

/* eslint-disable-next-line no-unused-vars */
function wkr(entity) {
    const xml = { WKR: { _attr: {} } };
    const attr = xml.WKR._attr;
    fmis.addId(attr, entity, 'WKR');
    fmis.addAttribute(attr, entity, 'B', 'familyName');
    fmis.addAttribute(attr, entity, 'C', 'givenName');
    fmis.addAddressAttribute(attr, entity, 'D', 'address');
    fmis.addAttribute(attr, entity, 'J', 'telephone');
    fmis.addAttribute(attr, entity, 'K', 'mobile');
    fmis.addAttribute(attr, entity, 'L', 'faxNumber');
    fmis.addAttribute(attr, entity, 'M', 'eMail');
    return xml;
}

module.exports = {
    ctr,
    frm,
    wkr,
    resetIndex : fmis.resetIndex
};
