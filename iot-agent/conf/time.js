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

const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'TIM';
const ngsiType = 'TimeEvent';

const dataLogValue = require('./dataLogValue');

/*
A Start
B Stop
C Duration
D Type
 1 = Planned
 2 = Preliminary
 4 = Effective
 5 = Ineffective
 6 = Repair
 7 = Clearing
 8 = Powered Down

Position
DataLogValue 
*/

const TIME_TYPES = {
    '1': 'planned',
    '2': 'preliminary',
    '4': 'effective',
    '5': 'ineffective',
    '6': 'repair',
    '7': 'clearing',
    '8': 'poweredDown'
};

function extractPosition(data) {
    const position = {};
    const coordinates = [data.A, data.B];
    if (Object.keys(data).length === 2) {
        return { type: 'Point', coordinates };
    }
    if (data.C) {
        coordinates.push(data.C);
        if (Object.keys(data).length === 3) {
            return { type: 'Point', coordinates };
        }
    }

    position.location = { type: 'Point', coordinates };
    position.status = data.D ? parseInt(data.D) : undefined;
    position.PDOP = data.E ? parseInt(data.E) : undefined;
    position.HDOP = data.F ? parseInt(data.F) : undefined;
    position.numberOfSatellites = data.G ? parseInt(data.G) : undefined;
    position.gpsUtcTime = data.H ? parseInt(data.H) : undefined;
    position.gpsUtcDate = data.I ? parseInt(data.I) : undefined;

    return position;
}

/**
 * This function maps an NGSI object to an ISOXML TIM
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'startTime');
    FMIS.addAttribute(attr, entity, 'B', 'endTime');
    FMIS.addAttribute(attr, entity, 'C', 'duration');
    FMIS.addAttribute(attr, entity, 'D', 'type');
    return xml;
}

/**
 * This function maps an ISOXML TIM to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'startTime', schema.DATETIME, normalized);
    MICS.addProperty(entity, 'B', 'endTime', schema.DATETIME, normalized);
    MICS.addInt(entity, 'C', 'duration', schema.NUMBER, normalized);
    MICS.addMappedProperty(entity, 'D', 'type', schema.TEXT, TIME_TYPES, normalized);

    MICS.addArray(entity, dataLogValue, 'data', normalized);

    let position = entity.ptn;
    if (position) {
        if (!Array.isArray(position)) {
            position = [position];
        }

        const keys = Object.keys(position[0]);
        if (position.length === 2) {
            entity.startPoint = extractPosition(position[0]);
            entity.endPoint = extractPosition(position[1]);
        } else if (keys === 2 || (keys === 3 && !!position[0].C)) {
            entity.location = extractPosition(position[0]);
        } else {
            entity.startPoint = extractPosition(position[0]);
        }
    }
    delete entity.ptn;

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
