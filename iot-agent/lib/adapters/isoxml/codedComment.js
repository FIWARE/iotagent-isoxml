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

const isoxmlType = 'CCT';
const ngsiType = 'CodedComment';

const codedCommentGroup = require('./codedCommentGroup');
const codedCommentListValue = require('./codedCommentListValue');

/*

A CodedCommentId
B CodedCommentDesignator
C CodedCommentScope
   1 = point
   2 = global
   3 = continuous
D CodedCommentGroupIdRef

CodedCommentListValue

*/

const COMMENT_SCOPE = {
    '1': 'point',
    '2': 'global',
    '3': 'continuous'
};

/**
 * This function maps an NGSI object to an ISOXML CCL
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addAttribute(attr, entity, 'C', 'scope');
    FMIS.addRelationship(attr, entity, 'D', 'codedCommentGroupIdRef', codedCommentGroup.isoxmlType);

    return xml;
}

/**
 * This function maps an ISOXML CCL to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addMappedProperty(entity, 'C', 'scope', schema.TEXT, COMMENT_SCOPE, normalized);
    MICS.addRelationship(entity, 'D', 'codedCommentGroupIdRef', codedCommentGroup.ngsiType, normalized);

    MICS.addArray(entity, codedCommentListValue, 'codedCommentListValue', normalized);
    return entity;
}

function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'codedCommentGroupIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
