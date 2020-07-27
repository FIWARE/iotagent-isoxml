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

const isoxmlType = 'TCC';
const ngsiType = 'TaskControllerCapabilities';

/*
A id
B name
C versionNumber
D providedCapabilities
E numberOfBoomsSectionControl
F numberOfSectionsSectionControl
G NumberOfControlChannels
*/

/**
 * This function maps an NGSI object to an ISOXML TCC
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'id');
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'versionNumber');
    FMIS.addAttribute(attr, entity, 'D', 'providedCapabilities');
    FMIS.addAttribute(attr, entity, 'E', 'numberOfBoomsSectionControl');
    FMIS.addAttribute(attr, entity, 'F', 'numberOfSectionsSectionControl');
    FMIS.addAttribute(attr, entity, 'G', 'numberOfControlChannels');

    return xml;
}

/**
 * This function maps an ISOXML TCC to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'id', schema.Text, normalized);
    MICS.addProperty(entity, 'B', 'name', schema.Text, normalized);
    MICS.addInt(entity, 'C', 'versionNumber', schema.Number, normalized);
    MICS.addInt(entity, 'D', 'providedCapabilities', schema.Number, normalized);
    MICS.addInt(entity, 'E', 'numberOfBoomsSectionControl', schema.Number, normalized);
    MICS.addInt(entity, 'F', 'numberOfSectionsSectionControl', schema.Number, normalized);
    MICS.addInt(entity, 'G', 'numberOfControlChannels', schema.Number, normalized);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
