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

const isoxmlType = 'LSG';
const ngsiType = 'LineString';
const from = isoxmlType.toLowerCase();

/*
A LineStringType
	1 = PolygonExterior
	2 = PolygonInterior
	3 = TramLine
	4 = SamplingRoute
	5 = GuidancePattern
	6 = Drainage
	7 = Fence
	8 = Flag
	9 = Obstacle

B LineStringDesignator
C LineStringWidth
D LineStringLength
E LineStringColour
F LineStringId

*/

const LINE_STRING_TYPES = {
    '1': 'polygonExterior',
    '2': 'polygonInterior',
    '3': 'tramLine',
    '4': 'samplingRoute',
    '5': 'guidancePattern',
    '6': 'drainage',
    '7': 'fence',
    '8': 'flag',
    '9': 'obstacle'
};

function extractSingleLineStringData(data) {
    const lineString = {};
    lineString.category = data.A ? LINE_STRING_TYPES[data.A] : undefined;
    lineString.name = data.B ? data.B : undefined;
    lineString.width = data.C ? parseInt(data.C)/ 1000.0 : undefined;
    lineString.length = data.D ? parseInt(data.D)/1000.0 : undefined;
    lineString.color = data.E ? parseInt(data.E) : undefined;
    lineString.id = data.F ? transforms.generateURI(data.F, ngsiType) : undefined;
    return lineString;
}

function extractSingleLineStringGeoJSON(data, type, normalized) {
    const coordinates = [];
    data.pnt.forEach((point) => {
        coordinates.push(extractCoordinates(point));
    });
    const value = {
        type: 'LineString',
        coordinates
    };

    return normalized ? {type, value}  : value;
}

function extractMultiLineStringData(data, type, normalized) {
    const multilineString = [];
    data.forEach((lineString) => {
        multilineString.push(extractSingleLineStringData(lineString, type, false));
    });
    return multilineString;
}

function extractMultiLineStringGeoJSON(data, type, normalized) {
    const lineStrings = [];
    data.lsg.forEach((lineString) => {
        const coordinates = [];
        lineString.pnt.forEach((point) => {
            coordinates.push(extractCoordinates(point));
        });
        lineStrings.push(coordinates);
    });

    const value = {
        type: 'MultiLineString',
        coordinates: lineStrings
    };
    return normalized ? {type, value}  : value;
}

function extractCoordinates(data) {
    const coordinates = [parseFloat(data.D), parseFloat(data.C)];
    if (data.E) {
        coordinates.push(parseFloat(data.E) /1000.0);
    }
    return coordinates;
}

function addLineString(entity, to, type = 'GeoProperty', normalized = false) {
    if (entity[from]) {
        let value;
        let isoxmlData = entity[from];
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }

        if (isoxmlData.length === 1) {
            value = extractSingleLineStringGeoJSON(isoxmlData[0], type, normalized);
        } else {
            value  = extractMultiLineStringGeoJSON(isoxmlData, type, normalized);
        }

        entity[to] = normalized ? {type, value}  : value;
    }
}

function addLineStringData(entity, to, type, normalized = false) {
    if (entity[from]) {
        let isoxmlData = entity[from];
        let value;
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }
        if (isoxmlData.length === 1) {
            value =  extractSingleLineStringData(isoxmlData[0], type, normalized );
        } else {
            value = entity[to] = extractMultiLineStringData(isoxmlData, type, normalized);
        }
        entity[to] = normalized ? {type, value}  : value;
    }
}

module.exports = {
    isoxmlType,
    ngsiType,
    add: addLineString,
    addData: addLineStringData
};
