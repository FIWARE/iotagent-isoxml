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

const isoxmlType = 'DVC';
const ngsiType = 'Device';

const deviceElement = require('./deviceElement');
const deviceProcessData = require('./deviceProcessData');
const deviceProperty = require('./deviceProperty');
const deviceValuePresentation = require('./deviceValuePresentation');

/*
A DeviceId
B DeviceDesignator
C DeviceSoftwareVersion
D ClientName
E DeviceSerialNumber
F DeviceStructureLabel
G DeviceLocalizationLabel


DeviceElement
DeviceProcessData
DeviceProperty
DeviceValuePresentation
*/

/**
 * This function maps an NGSI object to an ISOXML DVC
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'softwareVersion');
    FMIS.addAttribute(attr, entity, 'D', 'clientName');
    FMIS.addAttribute(attr, entity, 'E', 'serialNumber');
    FMIS.addAttribute(attr, entity, 'F', 'structureLabel');
    FMIS.addAttribute(attr, entity, 'G', 'localizationLabel');

    return xml;
}

/**
 * This function maps an ISOXML DVC to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'softwareVersion', schema.TEXT, normalized);
    MICS.addProperty(entity, 'D', 'clientName', schema.TEXT, normalized);
    MICS.addProperty(entity, 'E', 'serialNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'F', 'structureLabel', schema.TEXT, normalized);
    MICS.addProperty(entity, 'G', 'localizationLabel', schema.TEXT, normalized);

    MICS.addArray(entity, deviceElement, 'deviceElement', normalized);
    MICS.addArray(entity, deviceProcessData, 'deviceProcessData', normalized);
    MICS.addArray(entity, deviceProperty, 'deviceProperty', normalized);
    MICS.addArray(entity, deviceValuePresentation, 'deviceValuePresentation', normalized);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
