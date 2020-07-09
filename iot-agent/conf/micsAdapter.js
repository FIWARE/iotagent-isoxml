const mics = require('./micsFunctions');

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

/* eslint-disable-next-line no-unused-vars */
function ctr(entity, typeInformation) {
    mics.addProperty(entity, 'B', 'familyName', 'Text');
    mics.addProperty(entity, 'C', 'givenName', 'Text');
    mics.addAddressProperty(entity, 'D', 'address', 'PostalAddress');
    mics.addProperty(entity, 'J', 'telephone', 'Text');
    mics.addProperty(entity, 'K', 'mobile', 'Text');
    mics.addProperty(entity, 'L', 'licenseNumber', 'Text');
    mics.addProperty(entity, 'M', 'eMail', 'Text');
    return entity;
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
function frm(entity, typeInformation) {
    mics.addProperty(entity, 'B', 'name', 'Text');
    mics.addAddressProperty(entity, 'C', 'address', 'PostalAddress');
    mics.addRelationship(entity, 'I', 'owner', 'Person');
    return entity;
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
function wkr(entity, typeInformation) {
    mics.addProperty(entity, 'B', 'familyName', 'Text');
    mics.addProperty(entity, 'C', 'givenName', 'Text');
    mics.addAddressProperty(entity, 'D', 'address', 'PostalAddress');
    mics.addProperty(entity, 'J', 'telephone', 'Text');
    mics.addProperty(entity, 'K', 'mobile', 'Text');
    mics.addProperty(entity, 'L', 'faxNumber', 'Text');
    mics.addProperty(entity, 'M', 'eMail', 'Text');
    return entity;
}

module.exports = {
    ctr,
    frm,
    wkr,

    generateURI: mics.generateURI
};
