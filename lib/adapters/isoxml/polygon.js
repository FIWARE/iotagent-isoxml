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
    '1': 'partfieldBoundary',
    '2': 'treatmentZone',
    '3': 'waterSurface',
    '4': 'building',
    '5': 'road',
    '6': 'obstacle',
    '7': 'flag',
    '8': 'other',
    '9': 'mainfield',
    '10': 'headland',
    '11': 'bufferZone',
    '12': 'windbreak'
};

function compareCoordinates(a, b){
    if (a.length !== b.length){
        return false;
    }
    return a.every((value, index) => { return value === b[index]});

}

function extractSinglePolygonData(data) {

    const polygon = {};
    polygon.category = data.A ? POLYGON_TYPES[data.A] : undefined;
    polygon.name = data.B ? data.B : undefined;
    polygon.area = data.C ? parseInt(data.C) : undefined;
    polygon.color = data.D ? parseInt(data.D) : undefined;
    polygon.id = data.E ? transforms.generateURI(data.E, ngsiType) : undefined;
    return polygon;
}

function extractSinglePolygonGeoJSON(data, type, normalized) {
    const coordinates = [];
    const lsg = Array.isArray(data.lsg) ? data.lsg : [data.lsg];
    lsg.forEach((lineString) => {
        const boundary = [];
        lineString.pnt.forEach((point) => {
            boundary.push(extractCoordinates(point));
        });
        // ensure Polygon is a GeoJSON linear ring.
        if (!compareCoordinates(boundary[0], boundary[boundary.length -1])){
            boundary.push(boundary[0]);
        }
        coordinates.push(boundary);
    });
    const value =  {
        type: 'Polygon',
        coordinates
    };
    return normalized ? {type, value}  : value;
}

function extractMultiPolygonData(data) {
    const multiPolygon = [];
    data.forEach((polygon) => {
        const value = polygon.value ? polygon.value : polygon;
        multiPolygon.push(extractSinglePolygonData(value, false));
    });
    return multiPolygon;
}

function extractMultiPolygonGeoJSON(data, type, normalized) {
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

    const value = {
        type: 'MultiPolygon',
        coordinates: polygons
    };
    return normalized ? {type, value}  : value;
}

function extractCoordinates(data) {
    const coordinates = [parseFloat(data.D), parseFloat(data.C)];
    if (data.E) {
        coordinates.push(parseFloat(data.E)/ 1000.0);
    }
    return coordinates;
}

function addPolygonGeoJSON(entity, to, type = 'GeoProperty', normalized = false) {
    if (entity[from]) {
        let isoxmlData = entity[from];
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }

        if (isoxmlData.length === 1) {
            const data = isoxmlData[0].value ? isoxmlData[0].value : isoxmlData[0];
            entity[to] = extractSinglePolygonGeoJSON(data, type, normalized);
        } else {
            entity[to] = extractMultiPolygonGeoJSON(isoxmlData, type, normalized);
        }
    }
}

function addPolygonData(entity, to, type, normalized = false) {
    if (entity[from]) {
        let isoxmlData = entity[from];
        let value;
        if (!Array.isArray(isoxmlData)) {
            isoxmlData = [isoxmlData];
        }
        if (isoxmlData.length === 1) {
            const data = isoxmlData[0].value ? isoxmlData[0].value : isoxmlData[0];
            value =  extractSinglePolygonData(data);
        } else {
            value = entity[to] = extractMultiPolygonData(isoxmlData);
        }
        entity[to] = normalized ? {type, value}  : value;
    }
}

module.exports = {
    isoxmlType,
    ngsiType,
    add: addPolygonGeoJSON,
    addData: addPolygonData
};
