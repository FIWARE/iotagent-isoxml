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

const isoxmlType = 'PNT';
const ngsiType = 'Point';
const from = isoxmlType.toLowerCase();

/*
A Point Type
	1 = Flag
    2 = other
    3 = Field Access
    4 = Storage
    5 = Obstacle
    6 = Guidance Reference A, start point of a guidance line
    7 = Guidance Reference B, end point of a guidance line
    8 = Guidance Reference Center
    9 = Guidance Point
    10 = Partfield Reference Point
    11 = Homebase

B PointDesignator
C PointNorth
D PointEast
E PointUp
F PointColour

*/

const POINT_TYPES = {
    '1': 'Flag',
    '2': 'other',
    '3': 'Field Access',
    '4': 'Storage',
    '5': 'Obstacle',
    '6': 'Start',
    '7': 'End',
    '8': 'Center',
    '9': 'Guidance Point',
    '10': 'Partfield Reference Point',
    '11': 'Homebase'
};

function extractSinglePointData(data) {
    const point = {};
    point.type = data.A ? POINT_TYPES[data.A] : undefined;
    point.name = data.B ? data.B : undefined;
    point.id = data.F ? parseInt(data.F) : undefined;
    return point;
}

function extractSinglePointGeoJSON(data) {
    return {
        type: 'Point',
        coordinates: extractCoordinates(data)
    };
}

function extractMultiPointData(data) {
    const multipoint = [];
    data.forEach((point) => {
        multipoint.push(extractSinglePointData(point, false));
    });
    return multipoint;
}

function extractMultiPointGeoJSON(data) {
    const points = [];
    data.pnt.forEach((point) => {
        points.push(extractCoordinates(point));
    });

    return {
        type: 'MultiPoint',
        coordinates: points
    };
}

function extractCoordinates(data) {
    const coordinates = [parseFloat(data.D), parseFloat(data.C)];
    if (data.E) {
        coordinates.push(parseFloat(data.E));
    }
    return coordinates;
}

function addPoint(entity, to) {
    if (entity[from]) {
        const point = {};
        let isoxmlData = entity[from];
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }

        if (isoxmlData.length === 1) {
            point.data = extractSinglePointData(isoxmlData[0]);
            point.location = extractSinglePointGeoJSON(isoxmlData[0]);
        } else {
            point.data = extractMultiPointData(isoxmlData);
            point.location = extractMultiPointGeoJSON(isoxmlData);
        }

        entity[to] = point;

        delete entity[from];
    }
}

module.exports = {
    isoxmlType,
    ngsiType,
    add: addPoint
};
