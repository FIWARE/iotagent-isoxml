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

const allocationStamp = require('./allocationStamp');
const guidanceShift = require('./guidanceShift');
const guidanceGroup = require('./guidanceGroup');
const isoxmlType = 'GAN';
const ngsiType = 'GuidanceAllocation';

/*
A GuidanceGroupIdRef
*/

/**
 * This function maps an NGSI object to an ISOXML GAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'groupIdRef', guidanceGroup.isoxmlType);
    return xml;
}

/**
 * This function maps an ISOXML GAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'groupIdRef', guidanceGroup.ngsiType, normalized);
    allocationStamp.add(entity);
    MICS.addArray(entity, guidanceShift, 'guidanceShift');
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML CAN
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'groupIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
