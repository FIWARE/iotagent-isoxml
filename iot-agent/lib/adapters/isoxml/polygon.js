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

const isoxmlType = 'PLN';
const ngsiType = 'Polygon';
const from = isoxmlType.toLowerCase();

/*
A PolygonType
	1 = Partfield Boundary
	2 = TreatmentZone
	3 = WaterSurface
	4 = Building
	5 = Road
	6 = Obstacle
	7 = Flag
	8 = Other
	9 = Mainfield
	10 = Headland
	11 = BufferZone
	12 = Windbreak
B name
C PolygonArea
D PolygonColour
E PolygonId
*/

const POLYGON_TYPES = {
    '1': 'Partfield Boundary',
    '2': 'TreatmentZone',
    '3': 'WaterSurface',
    '4': 'Building',
    '5': 'Road',
    '6': 'Obstacle',
    '7': 'Flag',
    '8': 'Other',
    '9': 'Mainfield',
    '10': 'Headland',
    '11': 'BufferZone',
    '12': 'Windbreak'
};

function extractSinglePolygonData(data) {
    const polygon = {};
    polygon.type = data.A ? POLYGON_TYPES[data.A] : undefined;
    polygon.name = data.B ? data.B : undefined;
    polygon.area = data.C ? parseInt(data.C) : undefined;
    polygon.color = data.D ? parseInt(data.D) : undefined;
    polygon.id = data.E ? transforms.generateURI(data.E, ngsiType) : undefined;
    return polygon;
}

function extractSinglePolygonGeoJSON(data) {
    const coordinates = [];
    const lsg = Array.isArray(data.lsg) ? data.lsg : [data.lsg];
    lsg.forEach((lineString) => {
        const boundary = [];
        lineString.pnt.forEach((point) => {
            boundary.push(extractCoordinates(point));
        });
        coordinates.push(boundary);
    });

    return {
        type: 'Polygon',
        coordinates
    };
}

function extractMultiPolygonData(data) {
    const multiPolygon = [];
    data.forEach((polygon) => {
        multiPolygon.push(extractSinglePolygonData(polygon, false));
    });
    return multiPolygon;
}

function extractMultiPolygonGeoJSON(data) {
    const polygons = [];
    data.forEach((polygon) => {
        const coordinates = [];
        const lsg = Array.isArray(polygon.lsg) ? polygon.lsg : [polygon.lsg];
        lsg.forEach((lineString) => {
            const boundary = [];
            lineString.pnt.forEach((point) => {
                boundary.push(extractCoordinates(point));
            });
            coordinates.push(boundary);
        });
        polygons.push(coordinates);
    });

    return {
        type: 'MultiPolygon',
        coordinates: polygons
    };
}

function extractCoordinates(data) {
    const coordinates = [parseFloat(data.C), parseFloat(data.D)];
    if (data.E) {
        coordinates.push(parseFloat(data.E));
    }
    return coordinates;
}

function addPolygon(entity, to) {
    if (entity[from]) {
        const polygon = {};
        let isoxmlData = entity[from];
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }

        if (isoxmlData.length === 1) {
            polygon.data = extractSinglePolygonData(isoxmlData[0]);
            polygon.location = extractSinglePolygonGeoJSON(isoxmlData[0]);
        } else {
            polygon.data = extractMultiPolygonData(isoxmlData);
            polygon.location = extractMultiPolygonGeoJSON(isoxmlData);
        }

        entity[to] = polygon;

        delete entity[from];
    }
}

module.exports = {
    isoxmlType,
    ngsiType,
    add: addPolygon
};
