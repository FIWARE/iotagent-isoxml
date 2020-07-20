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

const isoxmlType = 'DLT';
const ngsiType = 'DataLogTrigger';

const deviceElement = require('./deviceElement');
const valuePresentation = require('./valuePresentation');
/*
A DataLogDDI
B DataLogMethod
C DataLogDistanceInterval
D DataLogTimeInterval
E DataLogThresholdMinimum
F DataLogThresholdMaximum
G DataLogThresholdChange
H DeviceElementIdRef
I ValuePresentationIdRef
J DataLogPGN
K DataLogPGNStartBit
L DataLogPGNStopBit
*/

/**
 * This function maps an NSGI Object to ISOXML DLT
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'ddi');
    FMIS.addAttribute(attr, entity, 'B', 'method');
    FMIS.addAttribute(attr, entity, 'C', 'distanceInterval');
    FMIS.addAttribute(attr, entity, 'D', 'timeInterval');
    FMIS.addAttribute(attr, entity, 'E', 'thresholdMinimum');
    FMIS.addAttribute(attr, entity, 'F', 'thresholdMaximum');
    FMIS.addAttribute(attr, entity, 'G', 'thresholdChange');
    FMIS.addRelationship(attr, entity, 'H', 'deviceElementId', deviceElement.isoxmlType);
    FMIS.addRelationship(attr, entity, 'I', 'valuePresentationId', valuePresentation.isoxmlType);
    FMIS.addAttribute(attr, entity, 'J', 'PGN');
    FMIS.addAttribute(attr, entity, 'K', 'PGNStartBit');
    FMIS.addAttribute(attr, entity, 'L', 'PGNStopBit');
    return xml;
}

/**
 * This function maps an ISOXML DLT to an NSGI Object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'ddi', schema.TEXT, normalized);
    MICS.addInt(entity, 'B', 'method', schema.NUMBER, normalized);
    MICS.addInt(entity, 'C', 'distanceInterval', schema.NUMBER, normalized);
    MICS.addInt(entity, 'D', 'timeInterval', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'E', 'thresholdMinimum', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'F', 'thresholdMaximum', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'G', 'thresholdChange', schema.NUMBER, normalized);
    MICS.addRelationship(entity, 'H', 'deviceElementId', deviceElement.ngsiType, normalized);
    MICS.addRelationship(entity, 'I', 'valuePresentationId', valuePresentation.ngsiType, normalized);
    MICS.addInt(entity, 'J', 'PGN', schema.NUMBER, normalized);
    MICS.addInt(entity, 'K', 'PGNStartBit', schema.NUMBER, normalized);
    MICS.addInt(entity, 'L', 'PGNStopBit', schema.NUMBER, normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML DLT
*    Building.owner = I  - CustomerIdRef 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'deviceElementId');
    transforms.addReference(refs, entity, 'valuePresentationId');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
