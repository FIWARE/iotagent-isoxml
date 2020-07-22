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

const isoxmlType = 'DPD';
const ngsiType = 'DeviceProcessData';

/*
A DeviceProcessDataObjectId
B DeviceProcessDataDDI
C DeviceProcessDataProperty
	1 = belongs to default set 
	2 = settable
	4 = control source
D DeviceProcessDataTriggerMethods
	1 = time interval
	2 = distance interval 
	4 = threshold limits 
	8 = on change
	16 = total
E DeviceProcessDataDesignator
F DeviceValuePresentationObjectId

*/

/**
 * This function maps an NGSI object to an ISOXML DPD
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'objectId');
    FMIS.addAttribute(attr, entity, 'B', 'ddi');
    FMIS.addAttribute(attr, entity, 'C', 'property');
    FMIS.addAttribute(attr, entity, 'D', 'triggerMethods');
    FMIS.addAttribute(attr, entity, 'E', 'name');
    FMIS.addAttribute(attr, entity, 'F', 'presentationObjectId');

    return xml;
}

/**
 * This function maps an ISOXML DPD to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addInt(entity, 'A', 'objectId', schema.NUMBER, normalized);
    MICS.addProperty(entity, 'B', 'ddi', schema.TEXT, normalized);
    MICS.addInt(entity, 'C', 'property', schema.NUMBER, normalized);
    MICS.addInt(entity, 'D', 'triggerMethods', schema.NUMBER, normalized);
    MICS.addProperty(entity, 'E', 'name', schema.TEXT, normalized);
    MICS.addInt(entity, 'F', 'presentationObjectId', schema.NUMBER, normalized);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
