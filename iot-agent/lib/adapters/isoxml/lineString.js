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
    '1': 'PolygonExterior',
    '2': 'PolygonInterior',
    '3': 'TramLine',
    '4': 'SamplingRoute',
    '5': 'GuidancePattern',
    '6': 'Drainage',
    '7': 'Fence',
    '8': 'Flag',
    '9': 'Obstacle'
};

function extractSingleLineStringData(data) {
    const lineString = {};
    lineString.type = data.A ? LINE_STRING_TYPES[data.A] : undefined;
    lineString.name = data.B ? data.B : undefined;
    lineString.width = data.C ? parseInt(data.C) : undefined;
    lineString.length = data.D ? parseInt(data.D) : undefined;
    lineString.color = data.E ? parseInt(data.E) : undefined;
    lineString.id = data.F ? transforms.generateURI(data.F, ngsiType) : undefined;
    return lineString;
}

function extractSingleLineStringGeoJSON(data) {
    const coordinates = [];
    data.lsg.pnt.forEach((point) => {
        coordinates.push(extractCoordinates(point));
    });
    return {
        type: 'LineString',
        coordinates
    };
}

function extractMultiLineStringData(data) {
    const multilineString = [];
    data.forEach((lineString) => {
        multilineString.push(extractSingleLineStringData(lineString, false));
    });
    return multilineString;
}

function extractMultiLineStringGeoJSON(data) {
    const lineStrings = [];
    data.lsg.forEach((lineString) => {
        const coordinates = [];
        lineString.pnt.forEach((point) => {
            coordinates.push(extractCoordinates(point));
        });
        lineStrings.push(coordinates);
    });

    return {
        type: 'MultiLineString',
        coordinates: lineStrings
    };
}

function extractCoordinates(data) {
    const coordinates = [parseFloat(data.C), parseFloat(data.D)];
    if (data.E) {
        coordinates.push(parseFloat(data.E));
    }
    return coordinates;
}

function addLineString(entity, to) {
    if (entity[from]) {
        const lineString = {};
        let isoxmlData = entity[from];
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }

        if (isoxmlData.length === 1) {
            lineString.data = extractSingleLineStringData(isoxmlData[0]);
            lineString.location = extractSingleLineStringGeoJSON(isoxmlData[0]);
        } else {
            lineString.data = extractMultiLineStringData(isoxmlData);
            lineString.location = extractMultiLineStringGeoJSON(isoxmlData);
        }

        entity[to] = lineString;

        delete entity[from];
    }
}

module.exports = {
    isoxmlType,
    ngsiType,
    add: addLineString
};
