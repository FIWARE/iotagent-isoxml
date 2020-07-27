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

const isoxmlType = 'GPN';
const ngsiType = 'GuidancePattern';

const baseStation = require('./baseStation');
const lineString = require('./lineString');
const polygon = require('./polygon');

/*
A GuidancePatternId
B GuidancePatternDesignator
C GuidancePatternType
D GuidancePatternOptions
E GuidancePatternPropagationDirection
F GuidancePatternExtension
G GuidancePatternHeading
H GuidancePatternRadius
I GuidancePatternGNSSMethod
J GuidancePatternHorizontalAccuracy
K GuidancePatternVerticalAccuracy
L BaseStationIdRef
M OriginalSRID
N NumberOfSwathsLeft
O NumberOfSwathsRight

LineString
Polygon
*/

const PATTERN_TYPE = {
    '1': 'AB',
    '2': 'A+',
    '3': 'Curve',
    '4': 'Pivot',
    '5': 'Spiral'
};
const PATTERN_OPTIONS = {
    '1': 'Clockwise',
    '2': 'Counter-clockwise',
    '3': 'Full Circle'
};

const PATTERN_DIRECTION = {
    '1': 'Both',
    '2': 'Left',
    '3': 'Right',
    '4': 'None'
};

const PATTERN_EXTENSION = {
    '1': 'Both',
    '2': 'First',
    '3': 'Last',
    '4': 'None'
};

const GNSS_METHOD = {
    '1': 'GNSS fix',
    '2': 'DGNSS fix',
    '3': 'Precise GNSS',
    '4': 'RTK Fixed Integer',
    '5': 'RTK Float',
    '6': 'Estimated (DR) mode',
    '7': 'Manual Input',
    '8': 'Simulate mode',
    '16': 'Desktop generated data',
    '17': 'Other'
};

/**
 * This function maps an NGSI object to an ISOXML GPN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'patternType');
    FMIS.addAttribute(attr, entity, 'D', 'patternOptions');
    FMIS.addAttribute(attr, entity, 'E', 'propagationDirection');
    FMIS.addAttribute(attr, entity, 'F', 'extension');
    FMIS.addAttribute(attr, entity, 'G', 'heading');
    FMIS.addAttribute(attr, entity, 'H', 'radius');
    FMIS.addAttribute(attr, entity, 'I', 'gnssMethod');
    FMIS.addAttribute(attr, entity, 'J', 'horizontalAccuracy');
    FMIS.addAttribute(attr, entity, 'K', 'verticalAccuracy');
    FMIS.addRelationship(attr, entity, 'L', 'baseStationIdRef', baseStation.isoxmlType);
    FMIS.addAttribute(attr, entity, 'M', 'originalSRID');
    FMIS.addAttribute(attr, entity, 'N', 'numberOfSwathsLeft');
    FMIS.addAttribute(attr, entity, 'O', 'numberOfSwathsRight');
    return xml;
}

/**
 * This function maps an ISOXML GPN to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addMappedProperty(entity, 'C', 'patternType', schema.TEXT, PATTERN_TYPE, normalized);
    MICS.addMappedProperty(entity, 'D', 'patternOptions', schema.TEXT, PATTERN_OPTIONS, normalized);
    MICS.addMappedProperty(entity, 'E', 'propagationDirection', schema.TEXT, PATTERN_DIRECTION, normalized);
    MICS.addMappedProperty(entity, 'F', 'extension', schema.TEXT, PATTERN_EXTENSION, normalized);
    MICS.addFloat(entity, 'G', 'heading', schema.NUMBER, normalized);
    MICS.addInt(entity, 'H', 'radius', schema.NUMBER, normalized);
    MICS.addMappedProperty(entity, 'I', 'gnssMethod', schema.TEXT, GNSS_METHOD, normalized);
    MICS.addFloat(entity, 'J', 'horizontalAccuracy', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'K', 'verticalAccuracy', schema.NUMBER, normalized);
    MICS.addRelationship(entity, 'L', 'baseStationIdRef', baseStation.ngsiType, normalized);
    MICS.addProperty(entity, 'M', 'originalSRID', schema.TEXT, normalized);
    MICS.addInt(entity, 'N', 'numberOfSwathsLeft', schema.NUMBER, normalized);
    MICS.addInt(entity, 'O', 'numberOfSwathsRight', schema.NUMBER, normalized);

    lineString.add(entity, 'pattern', 'geo:json', normalized);
    lineString.addData(entity, 'patternData', 'Object', normalized);
    polygon.add(entity, 'boundary', 'geo:json', normalized);
    polygon.addData(entity, 'boundaryData', 'Object', normalized);

    delete entity.pln;
    delete entity.lsg;

    return entity;
}

function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'baseStationIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
