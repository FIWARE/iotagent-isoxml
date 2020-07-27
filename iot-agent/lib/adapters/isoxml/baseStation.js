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

const transforms = require('../transforms');
const schema = require('../schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'BSN';
const ngsiType = 'BaseStation';

/*

A BaseStationId
B BaseStationDesignator
C BaseStationNorth
D BaseStationEast
E BaseStationUp

*/

function getCoordinates(entity) {
    const coordinates = [getFloat(entity.C), getFloat(entity.D)];
    if (entity.E) {
        coordinates.push(getFloat(entity.E) / 1000.0);
    }
    return coordinates;
}

function getFloat(data) {
    return parseFloat(Object.prototype.hasOwnProperty.call(data, 'value') ? data.value : data);
}

/**
 * This function maps an NGSI object to an ISOXML BSN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'north');
    FMIS.addAttribute(attr, entity, 'D', 'east');
    FMIS.addAttribute(attr, entity, 'E', 'up');
    return xml;
}

/**
 * This function maps an ISOXML BSN to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, isoxmlType);
    }
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    if (entity.C && entity.D) {
        entity.location = {
            type: 'geo:json',
            value: {
                type: 'Point',
                coordinates: getCoordinates(entity)
            }
        };
    }
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
