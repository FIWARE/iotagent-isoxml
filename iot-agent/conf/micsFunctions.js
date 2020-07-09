/*
* Mobile Implement Control System
*/

const constants = require('../lib/constants');
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
    return constants.DEFAULT_URI_PREFIX + type + ':' + id;
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

module.exports = {
    addAddressProperty,
    addRelationship,
    addProperty,
    generateURI
};
