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

const isoxmlType = 'PFD';
const ngsiType = 'PartField';

const customer = require('./customer');
const farm = require('./farm');
const cropType = require('./cropType');
const cropVariety = require('./cropVariety');
const lineString = require('./lineString');
const polygon = require('./polygon');
const point = require('./point');
const guidanceGroup = require('./guidanceGroup');

/*
A PartfieldId
B PartfieldCode
C PartfieldDesignator
D PartfieldArea
E CustomerIdRef
F FarmIdRef
G CropTypeIdRef
H CropVarietyIdRef
I FieldIdRef

LineString
Polygon
Point 
GuidanceGroup
*/

/**
 * This function maps an NGSI object to an ISOXML GPN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'code');
    FMIS.addAttribute(attr, entity, 'C', 'name');
    FMIS.addAttribute(attr, entity, 'D', 'area');
    FMIS.addRelationship(attr, entity, 'E', 'customerIdRef', customer.isoxmlType);
    FMIS.addRelationship(attr, entity, 'F', 'farmIdRef', farm.isoxmlType);
    FMIS.addRelationship(attr, entity, 'G', 'cropTypeIdRef', cropType.isoxmlType);
    FMIS.addRelationship(attr, entity, 'H', 'cropVarietyIdRef', cropVariety.isoxmlType);
    FMIS.addRelationship(attr, entity, 'I', 'parent', isoxmlType);
    return xml;
}

/**
 * This function maps an ISOXML GPN to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addProperty(entity, 'B', 'code', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'name', schema.TEXT, normalized);
    MICS.addInt(entity, 'D', 'area', schema.NUMBER, normalized);
    MICS.addRelationship(entity, 'E', 'customerIdRef', customer.ngsiType, normalized);
    MICS.addRelationship(entity, 'F', 'farmIdRef', farm.ngsiType, normalized);
    MICS.addRelationship(entity, 'G', 'cropTypeIdRef', cropType.ngsiType, normalized);
    MICS.addRelationship(entity, 'H', 'cropVarietyIdRef', cropVariety.ngsiType, normalized);
    MICS.addRelationship(entity, 'I', 'parent', ngsiType, normalized);

    lineString.add(entity, 'lineString');
    polygon.add(entity, 'polygon');
    point.add(entity, 'point');

    MICS.addArray(entity, guidanceGroup, 'guidanceGroup', normalized);
    return entity;
}

function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'customerIdRef');
    transforms.addReference(refs, entity, 'farmIdRef');
    transforms.addReference(refs, entity, 'cropTypeIdRef');
    transforms.addReference(refs, entity, 'cropVarietyIdRef');
    transforms.addReference(refs, entity, 'parent');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
