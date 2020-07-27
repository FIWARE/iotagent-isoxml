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

const isoxmlType = 'DET';
const ngsiType = 'DeviceElement';

const deviceObjectReference = require('./deviceObjectReference');

/*
A DeviceElementId
B DeviceElementObjectId
C DeviceElementType
	1 = device
	2 = function
	3 = bin
	4 = section
	5 = unit
	6 = connector 
	7 = navigation

D DeviceElementDesignator
E DeviceElementNumber
F ParentObjectId

DeviceObjectReference
*/

const ELEMENT_TYPE = {
    '1': 'device',
    '2': 'function',
    '3': 'bin',
    '4': 'section',
    '5': 'unit',
    '6': 'connector',
    '7': 'navigation'
};

/**
 * This function maps an NGSI object to an ISOXML DET
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'objectId');
    FMIS.addAttribute(attr, entity, 'C', 'elementType');
    FMIS.addAttribute(attr, entity, 'D', 'name');
    FMIS.addAttribute(attr, entity, 'E', 'elementNumber');
    FMIS.addAttribute(attr, entity, 'F', 'parentObjectId');

    return xml;
}

/**
 * This function maps an ISOXML DET to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addInt(entity, 'B', 'objectId', schema.NUMBER, normalized);
    MICS.addMappedProperty(entity, 'C', 'elementType', schema.TEXT, ELEMENT_TYPE, normalized);
    MICS.addProperty(entity, 'D', 'name', schema.TEXT, normalized);
    MICS.addInt(entity, 'E', 'elementNumber', schema.NUMBER, normalized);
    MICS.addInt(entity, 'F', 'parentObjectId', schema.NUMBER, normalized);

    MICS.addArray(entity, deviceObjectReference, 'objectReference', normalized);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
