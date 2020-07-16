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

const allocationStamp = require('./allocationStamp');
const codedComment = require('./codedComment');
const codedCommentListValue = require('./codedCommentListValue');

const isoxmlType = 'CAN';
const ngsiType = 'CommentAllocation';

/*
A CodedCommentIdRef
B CodedCommentListValueIdRef
C FreeCommentText

AllocationStamp
*/

/**
 * This function maps an NGSI object to an ISOXML CAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'codedCommentIdRef', codedComment.isoxmlType);
    FMIS.addRelationship(attr, entity, 'B', 'codedCommentListValueIdRef', codedCommentListValue.isoxmlType);
    FMIS.addAttribute(attr, entity, 'C', 'comment');
    return xml;
}

/**
 * This function maps an ISOXML CAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'codedCommentIdRef', codedComment.ngsiType, normalized);
    MICS.addRelationship(entity, 'B', 'codedCommentListValueIdRef', codedCommentListValue.ngsiType, normalized);
    MICS.addProperty(entity, 'C', 'comment', schema.TEXT, normalized);
    allocationStamp.add(entity);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML CAN
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'codedCommentIdRef');
    transforms.addReference(refs, entity, 'codedCommentListValueIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType,
    relationships
};
