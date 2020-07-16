/*
 * Copyright 2020 FIWARE Foundation e.V.
 *
 * This file is part of iotagent-isoxml
 *
 * iotagent-isoxml is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-isoxml is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-isoxml.
 * If not, see http://www.gnu.org/licenses/.
 *
 */

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

function nsgiAttribute(type, value, normalized = false) {
    return normalized
        ? {
              type,
              value
          }
        : value;
}

// Return the value of an attribute if the value exists
function valueOf(entity, attr) {
    return entity[attr] ? entity[attr].value : undefined;
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

function getValue(entity) {
    return entity.value ? entity.value : entity;
}

function extractPosition(data) {
    const position = {};
    const coordinates = [data.A, data.B];
    if (data.C) {
        coordinates.push(data.C);
    }
    position.location = { type: 'Point', coordinates };
    position.status = data.D ? parseInt(data.D) : undefined;
    position.PDOP = data.E ? parseInt(data.E) : undefined;
    position.HDOP = data.F ? parseInt(data.F) : undefined;
    position.numberOfSatellites = data.G ? parseInt(data.G) : undefined;
    position.gpsUtcTime = data.H ? parseInt(data.H) : undefined;
    position.gpsUtcDate = data.I ? parseInt(data.I) : undefined;

    return position;
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

    addGeoPointProperty(entity, from, to, type = 'GeoProperty') {
        const attrs = allAttrs.slice(allAttrs.indexOf(from), allAttrs.indexOf(from + 1));
        let present = true;

        attrs.forEach((attr) => {
            present = present && entity[attr];
        });

        if (present) {
            entity[to] = {
                type,
                value: {
                    coordinates: [valueOf(entity, attrs[0]), valueOf(entity, attrs[1])],
                    type: 'Point'
                }
            };
        }
    },

    addProperty(entity, from, to, type = 'Property', normalized = true) {
        if (entity[from]) {
            const value = getValue(entity[from]);
            entity[to] = nsgiAttribute(type, value, normalized);
        }
    },

    addMappedProperty(entity, from, to, type = 'Property', map, normalized = true) {
        if (entity[from]) {
            const value = map[getValue(entity[from])];
            entity[to] = nsgiAttribute(type, value, normalized);
        }
    },

    addFloat(entity, from, to, type = 'Float', normalized = true) {
        if (entity[from]) {
            const value = parseFloat(getValue(entity[from]));
            entity[to] = nsgiAttribute(type, value, normalized);
        }
    },

    addInt(entity, from, to, type = 'Integer', normalized = true) {
        if (entity[from]) {
            const value = parseInt(getValue(entity[from]));
            entity[to] = nsgiAttribute(type, value, normalized);
        }
    },

    addArray(entity, adapter, to, normalized = false) {
        const from = adapter.isoxmlType.toLowerCase();
        const value = [];
        if (entity[from]) {
            let elements = getValue(entity[from]);
            if (!Array.isArray(elements)) {
                elements = [elements];
            }
            elements.forEach((element) => {
                const ngsi = adapter.transformMICS(element, false);

                allAttrs.forEach((attr) => {
                    delete ngsi[attr];
                });
                value.push(ngsi);
            });
            entity[to] = nsgiAttribute(adapter.ngsiType, value, normalized);
            delete entity[from];
        }
    },

    addObject(entity, adapter, to, normalized = false) {
        const from = adapter.isoxmlType.toLowerCase();
        if (entity[from]) {
            const value = adapter.transformMICS(getValue(entity[from]), false);
            allAttrs.forEach((attr) => {
                delete value[attr];
            });
            entity[to] = nsgiAttribute(adapter.ngsiType, value, normalized);
            delete entity[from];
        }
    },

    addTimestamp(entity, from) {
        const lowerFrom = from.toLowerCase();
        if (entity[lowerFrom]) {
            const timestamp = getValue(entity[lowerFrom]);
            let  position = timestamp.ptn;
            entity.startTime = timestamp.A ? getValue(timestamp.A): undefined;
            entity.endTime = timestamp.B ? getValue(timestamp.B): undefined;
            entity.duration = timestamp.C ? parseInt(getValue(timestamp.C)): undefined;

            if (!!timestamp.D) {
                if (timestamp.D === '1') {
                    entity.status = 'planned';
                } else if (timestamp.D === '4') {
                    entity.status = 'realized';
                }
            }
            if (!!position) {
                if (!Array.isArray(position)) {
                    position = [position];
                }
                if (position.length === 2) {
                    entity.startPoint = extractPosition(position[0]);
                    entity.endPoint = extractPosition(position[1]);
                } else if (entity.startTime) {
                    entity.startPoint = extractPosition(position[0]);
                } else {
                    entity.endPoint = extractPosition(position[0]);
                }
            }
            delete entity[lowerFrom];
        }
    },

    addRelationship(entity, from, to, type, normalized = true) {
        if (entity[from]) {
            entity[to] = normalized
                ? {
                      type: 'Relationship',
                      value: generateURI(getValue(entity[from]), type)
                  }
                : generateURI(getValue(entity[from]), type);
        }
    }
};

module.exports = {
    addReference,
    MICS,
    FMIS,
    generateURI
};
