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

const isoxmlType = 'DLV';
const ngsiType = 'StructuredValue';

const deviceElement = require('./deviceElement');

/*
A ProcessDataDDI
B ProcessDataValue
C DeviceElementIdRef
D DataLogPGN
E DataLogPGNStartBit
F DataLogPGNStopBit
*/

/**
 * This function maps an NSGI Object to ISOXML DLT
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'ddi');
    FMIS.addAttribute(attr, entity, 'B', 'value');
    FMIS.addRelationship(attr, entity, 'C', 'deviceElementId', deviceElement.isoxmlType);
    FMIS.addAttribute(attr, entity, 'D', 'PGN');
    FMIS.addAttribute(attr, entity, 'E', 'PGNStartBit');
    FMIS.addAttribute(attr, entity, 'F', 'PGNStopBit');
    return xml;
}

/**
 * This function maps an ISOXML DLT to an NSGI Object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'ddi', schema.TEXT, normalized);
    MICS.addInt(entity, 'B', 'value', schema.NUMBER, normalized);
    MICS.addRelationship(entity, 'C', 'deviceElementId', deviceElement.ngsiType, normalized);
    MICS.addInt(entity, 'D', 'PGN', schema.NUMBER, normalized);
    MICS.addInt(entity, 'E', 'PGNStartBit', schema.NUMBER, normalized);
    MICS.addInt(entity, 'F', 'PGNStopBit', schema.NUMBER, normalized);
    return entity;
}

/*
 *    This function lists the reference relationships of an ISOXML DLT
 *    Building.owner = I  - CustomerIdRef
 */
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'deviceElementId');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
