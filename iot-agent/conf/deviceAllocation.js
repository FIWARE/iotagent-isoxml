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

const isoxmlType = 'DAN';
const ngsiType = 'DeviceAllocation';

const allocationStamp = require('./allocationStamp');
/*
A clientNameValue
B clientNameMask
C deviceIdRef
*/

/**
 * This function maps an NGSI object to an ISOXML DAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'clientNameValue');
    FMIS.addAttribute(attr, entity, 'B', 'clientNameMask');
    FMIS.addRelationship(attr, entity, 'C', 'deviceIdRef', 'DVC');
    return xml;
}

/**
 * This function maps an ISOXML DAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'A', 'clientNameValue', schema.TEXT, normalized);
    MICS.addProperty(entity, 'B', 'clientNameMask', schema.TEXT, normalized);
    MICS.addRelationship(entity, 'C', 'deviceIdRef', 'Device', normalized);
    allocationStamp.add(entity);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML DAN 
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'deviceIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType,
    relationships
};
