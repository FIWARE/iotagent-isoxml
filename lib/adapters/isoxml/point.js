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
    '1': 'flag',
    '2': 'other',
    '3': 'fieldAccess',
    '4': 'storage',
    '5': 'obstacle',
    '6': 'start',
    '7': 'end',
    '8': 'center',
    '9': 'guidancePoint',
    '10': 'reference',
    '11': 'homebase'
};

function extractSinglePointData(data) {
    const point = {};
    point.category = data.A ? POINT_TYPES[data.A] : undefined;
    point.name = data.B ? data.B : undefined;
    point.colour = data.F ? parseInt(data.F) : undefined;
    return point;
}

function extractSinglePointGeoJSON(data, type, normalized) {
    const value = {
        type: 'Point',
        coordinates: extractCoordinates(data)
    };
    return normalized ? { type, value } : value;
}

function extractMultiPointData(data) {
    const multipoint = [];
    data.forEach((point) => {
        multipoint.push(extractSinglePointData(point, false));
    });
    return multipoint;
}

function extractMultiPointGeoJSON(data, type, normalized) {
    const points = [];
    data.pnt.forEach((point) => {
        points.push(extractCoordinates(point));
    });

    const value = {
        type: 'MultiPoint',
        coordinates: points
    };
    return normalized ? { type, value } : value;
}

function extractCoordinates(data) {
    const coordinates = [parseFloat(data.D), parseFloat(data.C)];
    if (data.E) {
        coordinates.push(parseFloat(data.E));
    }
    return coordinates;
}

function addPoint(entity, to, type, normalized = false) {
    if (entity[from]) {
        let isoxmlData = entity[from];
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }

        if (isoxmlData.length === 1) {
            const data = isoxmlData[0].value ? isoxmlData[0].value : isoxmlData[0];
            entity[to] = extractSinglePointGeoJSON(data, type, normalized);
        } else {
            entity[to] = extractMultiPointGeoJSON(isoxmlData, type, normalized);
        }
    }
}

function addPointData(entity, to, type, normalized = false) {
    if (entity[from]) {
        let isoxmlData = entity[from];
        let value;
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }
        if (isoxmlData.length === 1) {
            const data = isoxmlData[0].value ? isoxmlData[0].value : isoxmlData[0];
            value = extractSinglePointData(data);
        } else {
            value = extractMultiPointData(isoxmlData);
        }
        entity[to] = normalized ? { type, value } : value;
    }
}

module.exports = {
    isoxmlType,
    ngsiType,
    add: addPoint,
    addData: addPointData
};
