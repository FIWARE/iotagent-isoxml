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
const schema = require('../schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'GST';
const ngsiType = 'GuidanceShift';

const allocationStamp = require('./allocationStamp');
const guidanceGroup = require('./guidanceGroup');
const guidancePattern = require('./guidancePattern');

/*
A GuidanceGroupIdRef
B GuidancePatternIdRef
C GuidanceEastShift
D GuidanceNorthShift
E PropagationOffset
*/

/**
 * This function maps an NGSI object to an ISOXML GST
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'groupIdRef', guidanceGroup.isoxmlType);
    FMIS.addRelationship(attr, entity, 'B', 'patternIdRef', guidancePattern.isoxmlType);
    FMIS.addAttribute(attr, entity, 'C', 'eastShift');
    FMIS.addAttribute(attr, entity, 'D', 'northShift');
    FMIS.addAttribute(attr, entity, 'E', 'offset');
    return xml;
}

/**
 * This function maps an ISOXML GST to an NGSI object
 */
function transformMICS(entity) {
    MICS.addRelationship(entity, 'A', 'groupIdRef', guidanceGroup.ngsiType, false);
    MICS.addRelationship(entity, 'B', 'patternIdRef', guidancePattern.ngsiType, false);
    MICS.addInt(entity, 'C', 'eastShift', schema.NUMBER, false);
    MICS.addInt(entity, 'D', 'northShift', schema.NUMBER, false);
    MICS.addInt(entity, 'E', 'offset', schema.NUMBER, false);
    allocationStamp.add(entity);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML GST
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'groupIdRef');
    transforms.addReference(refs, entity, 'patternIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
