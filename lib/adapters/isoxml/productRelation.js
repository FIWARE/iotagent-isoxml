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

const isoxmlType = 'PRN';
const ngsiType = 'ProductRelation';

const product = require('./product');

/*
A productIdRef
B quantityValue
*/

/**
 * This function maps an NGSI object to an ISOXML PRN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'productIdRef', product.isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'quantityValue');
    return xml;
}

/**
 * This function maps an ISOXML PRN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'productIdRef', product.ngsiType, normalized);
    MICS.addInt(entity, 'B', 'quantityValue', schema.NUMBER, normalized);

    return entity;
}

function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'productIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    relationships,
    ngsiType
};
