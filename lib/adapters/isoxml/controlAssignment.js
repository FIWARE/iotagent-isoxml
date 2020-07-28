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

const isoxmlType = 'CAT';
const ngsiType = 'ControlAssignment';

const allocationStamp = require('./allocationStamp');

/*
A SourceClient
B UserClient
C SourceDeviceStructureLabel
D UserDeviceStructureLabel
E SourceDeviceElementNumber
F UserDeviceElementNumber
G ProcessDataDDI
*/

/**
 * This function maps an NGSI object to an ISOXML CAT
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'sourceClient');
    FMIS.addAttribute(attr, entity, 'B', 'userClient');
    FMIS.addAttribute(attr, entity, 'C', 'sourceDeviceStructureLabel');
    FMIS.addAttribute(attr, entity, 'D', 'userDeviceStructureLabel');
    FMIS.addAttribute(attr, entity, 'E', 'sourceDeviceElementNumber');
    FMIS.addAttribute(attr, entity, 'F', 'userDeviceElementNumber');
    FMIS.addAttribute(attr, entity, 'G', 'processDataDDI');

    return xml;
}

/**
 * This function maps an ISOXML CAT to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'sourceClient', schema.TEXT, normalized);
    MICS.addProperty(entity, 'B', 'userClient', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'sourceDeviceStructureLabel', schema.TEXT, normalized);
    MICS.addProperty(entity, 'D', 'userDeviceStructureLabel', schema.TEXT, normalized);
    MICS.addProperty(entity, 'E', 'sourceDeviceElementNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'F', 'userDeviceElementNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'G', 'processDataDDI', schema.TEXT, normalized);

    allocationStamp.add(entity);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
