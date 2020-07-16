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

function extractPosition (data){
    const position = {}
    const coordinates = [data.A, data.B];
    if (!!data.C){
        coordinates.push(data.C)
    }
    position.location = { type: 'Point', coordinates};
    position.status = !!data.D ? parseInt(data.D) : undefined;
    position.PDOP = !!data.E ? parseInt(data.E) : undefined;
    position.HDOP = !!data.F ? parseInt(data.F) : undefined;
    position.numberOfSatellites = !!data.G ? parseInt(data.G) : undefined;
    position.gpsUtcTime = !!data.H ? parseInt(data.H) : undefined;
    position.gpsUtcDate = !!data.I ? parseInt(data.I) : undefined;

    return position;
};

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

    addGeoPointProperty(entity, from, to, type='GeoProperty') {
        const attrs = allAttrs.slice(allAttrs.indexOf(from), allAttrs.indexOf(from + 1));
        let present = true;

        attrs.forEach((attr) => {
            present = present && entity[attr];
        });

        if (present) {
            entity[to] = {
                type : type,
                value: {
                    coordinates: [valueOf(entity, attrs[0]),valueOf(entity, attrs[1])],
                    type: 'Point'
                }
            };
        }
    },

    addProperty(entity, from, to, type = 'Property', normalized = true) {
        if (entity[from]) {
            const value = getValue(entity[from]);
            entity[to] = normalized
                ? {
                      type,
                      value
                  }
                : value;
        }
    },

    addMappedProperty(entity, from, to, type = 'Property', map, normalized = true) {
        if (entity[from]) {
            const value = map[getValue(entity[from])];
            entity[to] = normalized
                ? {
                      type,
                      value
                  }
                : value;
        }
    },

    addFloat(entity, from, to, type = 'Float', normalized = true) {
        if (entity[from]) {
            const value = parseFloat(getValue(entity[from]));
            entity[to] = normalized
                ? {
                      type,
                      value
                  }
                : value;
        }
    },

    addInt(entity, from, to, type = 'Integer', normalized = true) {
        if (entity[from]) {
            const value = parseInt(getValue(entity[from]));
            entity[to] = normalized
                ? {
                      type,
                      value
                  }
                : value;
        }
    },

    addArray(entity, adapter, to, normalized = false) {
        if (entity[adapter.isoxmlType]) {
            const elements = getValue(entity[adapter.isoxmlType]);
            const value = [];

            elements.forEach((element) => {
                const ngsi = adapter.transformMICS(element, false);

                allAttrs.forEach((attr) => {
                    delete ngsi[attr];
                });
                value.push(ngsi);
            });
            entity[to] = normalized
                ? {
                      type: adapter.ngsiType,
                      value
                  }
                : value;

            delete entity[adapter.isoxmlType];
        }
    },

    addObject(entity, adapter, to, normalized = false) {
        if (entity[adapter.isoxmlType]) {
            const elements = getValue(entity[adapter.isoxmlType]);
            let value = {};

            elements.forEach((element) => {
                value = adapter.transformMICS(element, false);
                allAttrs.forEach((attr) => {
                    delete value[attr];
                });
            });
            entity[to] = normalized
                ? {
                      type: adapter.ngsiType,
                      value
                  }
                : value;

            delete entity[adapter.isoxmlType];
        }
    },

    addTimestamp(entity, from) {
        if (entity[from]) {
            const timestamp = getValue(entity[from])[0];
            if(!!timestamp.A){
                entity.startTime = getValue(timestamp.A);
            }

            if(!!timestamp.B){
                entity.endTime = getValue(timestamp.A);
            }

            if(!!timestamp.C){
                entity.duration = parseInt(getValue(entity[from]));
            }
            if(!!timestamp.D){
                if (timestamp.D == 1){
                    entity.status = 'planned';
                } else if (timestamp.D == 4){
                    entity.status = 'realized';
                }
            } 
            if (!! timestamp.PTN) {
                if( timestamp.PTN.length == 2){
                    entity.startPoint = extractPosition(timestamp.PTN[0]);
                    entity.endPoint = extractPosition(timestamp.PTN[1]);
                } else if (!! entity.startTime) {
                    entity.startPoint = extractPosition(timestamp.PTN[0]);
                } else {
                    entity.endPoint = extractPosition(timestamp.PTN[0]);
                }
            }
            delete entity[from];
        }
    },

    addRelationship(entity, from, to, type, normalized = true) {
        if (entity[from]) {
            entity[to] = normalized ? {
                type: 'Relationship',
                value: generateURI(getValue(entity[from]), type)
            } :  generateURI(getValue(entity[from]), type);
        }
    }
};

module.exports = {
    addReference,
    MICS,
    FMIS,
    generateURI
};
