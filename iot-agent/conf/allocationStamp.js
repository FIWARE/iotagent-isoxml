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

const isoxmlType = 'ASP';
const from = isoxmlType.toLowerCase();

function extractPosition(data) {
    const position = {};
    const coordinates = [parseFloat(data.A), parseFloat(data.B)];
    if (Object.keys(data).length === 2) {
        return { type: 'Point', coordinates };
    }
    if (data.C) {
        coordinates.push(parseFloat(data.C));
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

function addTimestamp(entity) {
    if (entity[from]) {
        const timestamp = entity[from];
        let position = timestamp.ptn;
        entity.startTime = timestamp.A;
        entity.endTime = timestamp.B;
        entity.duration = timestamp.C ? parseInt(timestamp.C) : undefined;

        if (timestamp.D) {
            if (timestamp.D === '1') {
                entity.status = 'planned';
            } else if (timestamp.D === '4') {
                entity.status = 'realized';
            }
        }
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
        delete entity[from];
    }
}

module.exports = {
    add: addTimestamp
};
