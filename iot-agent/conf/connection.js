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
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'CNN';
const ngsiType = 'Connection';

/*
A deviceIdRef0
B deviceElementIdRef0
C deviceIdRef1
D deviceElementIdRef1
*/

/**
 * This function maps an NGSI object to an ISOXML CNN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'deviceIdRef0', 'DVC');
    FMIS.addRelationship(attr, entity, 'B', 'deviceElementIdRef0', 'DET');
    FMIS.addRelationship(attr, entity, 'C', 'deviceIdRef1', 'DVC');
    FMIS.addRelationship(attr, entity, 'D', 'deviceElementIdRef1', 'DET');
    return xml;
}

/**
 * This function maps an ISOXML CNN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'deviceIdRef0', 'Device', normalized);
    MICS.addRelationship(entity, 'B', 'deviceElementIdRef0', 'DeviceElement', normalized);
    MICS.addRelationship(entity, 'C', 'deviceIdRef1', 'Device', normalized);
    MICS.addRelationship(entity, 'D', 'deviceElementIdRef1', 'DeviceElement', normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML CNN 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'deviceIdRef0');
    transforms.addReference(refs, entity, 'deviceElementIdRef0');
    transforms.addReference(refs, entity, 'deviceIdRef1');
    transforms.addReference(refs, entity, 'deviceElementIdRef1');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType,
    relationships
};
