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

const isoxmlType = 'TZN';
const ngsiType = 'TreatmentZone';

const processDataVariable = require('./processDataVariable');
const polygon = require('./polygon');

/*
A TreatmentZoneCode 
B TreatmentZoneDesignator
C TreatmentZoneColour

Polygon
ProcessDataVariable
*/

/**
 * This function maps an NGSI object to an ISOXML TZN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'code');
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'color');
    return xml;
}

/**
 * This function maps an ISOXML TZN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'code', schema.TEXT, normalized);
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'color', schema.TEXT, normalized);

    polygon.add(entity, 'zone', 'geo:json', normalized);
    polygon.addData(entity, 'zoneData', 'Object', normalized);

    delete entity.pln;

    MICS.addArray(entity, processDataVariable, 'processDataVariable');
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
