const constants = require('../constants');
const allAttrs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const idRegex = /-?\d+$/g;
const addressAttrs = [
    'streetAddress',
    'postOfficeBoxNumber',
    'postalCode',
    'addressLocality',
    'addressRegion',
    'addressCountry'
];

// Return the value of an attribute if the value exists
function valueOf(entity, attr) {
    return entity[attr] ? entity[attr].value : null;
}

// Transform an ISOXML id into a valid NGSI-LD URI
function generateURI(id, type) {
    return constants.DEFAULT_URI_PREFIX + type + ':' + id;
}

// Add a reference to an array if it exists
function addReference(refs, entity, attr) {
    if (entity[attr]) {
        refs.push(entity[attr]);
    }
}

// FMIS transform functions
const FMIS = {
    idIndex: 0,
    resetIndex() {
        this.idIndex = 0;
    },

    addAddressAttribute(attr, entity, to, from) {
        const toAttrs = allAttrs.slice(allAttrs.indexOf(to), allAttrs.indexOf(to) + 6);
        if (entity[from]) {
            toAttrs.forEach((toAttr, index) => {
                if (entity[from][addressAttrs[index]]) {
                    attr[toAttr] = entity[from][addressAttrs[index]];
                }
            });
        }
    },

    addId(attr, entity, type) {
        const match = entity.id.match(idRegex);
        attr.A = String(type) + (match ? match[0] : this.idIndex++);
    },

    addAttribute(attr, entity, to, from) {
        if (entity[from]) {
            attr[to] = entity[from];
        }
    },

    addRelationship(attr, entity, to, from, type) {
        if (entity[from]) {
            const match = entity[from].match(idRegex);
            attr[to] = type + match[0];
        }
    }
};

// MICS transform functions
const MICS = {
    addAddressProperty(entity, from, to, type) {
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
    },

    addProperty(entity, from, to, type = 'Property') {
        if (entity[from]) {
            entity[to] = {
                type,
                value: entity[from].value
            };
        }
    },

    addRelationship(entity, from, to, type) {
        if (entity[from]) {
            entity[to] = {
                type: 'Relationship',
                value: generateURI(entity[from].value, type)
            };
        }
    }
};

module.exports = {
    addReference,
    MICS,
    FMIS,
    generateURI
};
