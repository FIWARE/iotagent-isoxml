const allAttrs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function addAddressProperty(entity, from, to, type) {
    const attrs = allAttrs.slice(allAttrs.indexOf(from), allAttrs.indexOf(from + 5));
    let present = false;

    attrs.forEach((attr) => {
        present = present || entity[attr];
    });

    if (present) {
        entity[to] = {
            type,
            value: {
                streetAddress: valueOf(entity, attrs[0]),
                postOfficeBoxNumber: valueOf(entity, attrs[1]),
                postalCode: valueOf(entity, attrs[2]),
                addressLocality: valueOf(entity, attrs[3]),
                addressRegion: valueOf(entity, attrs[4]),
                addressCountry: valueOf(entity, attrs[5])
            }
        };
    }
}

function generateURI(id, type) {
    return 'urn:ngsi-ld:' + type + ':' + id;
}

function addProperty(entity, from, to, type = 'Property') {
    if (entity[from]) {
        entity[to] = {
            type,
            value: entity[from].value
        };
    }
}

function addRelationship(entity, from, to, type) {
    if (entity[from]) {
        entity[to] = {
            type: 'Relationship',
            value: generateURI(entity[from].value, type)
        };
    }
}

function valueOf(entity, attr) {
    return entity[attr] ? entity[attr].value : null;
}

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

function ctr(entity, typeInformation) {
    addProperty(entity, 'B', 'familyName', 'Text');
    addProperty(entity, 'C', 'givenName', 'Text');
    addAddressProperty(entity, 'D', 'address', 'PostalAddress');
    addProperty(entity, 'J', 'telephone', 'Text');
    addProperty(entity, 'K', 'mobile', 'Text');
    addProperty(entity, 'L', 'licenseNumber', 'Text');
    addProperty(entity, 'M', 'eMail', 'Text');
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
function frm(entity, typeInformation) {
    addProperty(entity, 'B', 'name', 'Text');
    addAddressProperty(entity, 'C', 'address', 'PostalAddress');
    addRelationship(entity, 'I', 'owner', 'Person');
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

function wkr(entity, typeInformation) {
    addProperty(entity, 'B', 'familyName', 'Text');
    addProperty(entity, 'C', 'givenName', 'Text');
    addAddressProperty(entity, 'D', 'address', 'PostalAddress');
    addProperty(entity, 'J', 'telephone', 'Text');
    addProperty(entity, 'K', 'mobile', 'Text');
    addProperty(entity, 'L', 'faxNumber', 'Text');
    addProperty(entity, 'M', 'eMail', 'Text');
    return entity;
}

module.exports = {
    ctr,
    frm,
    wkr,

    generateURI
};
