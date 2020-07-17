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

const isoxmlType = 'PDV';
const ngsiType = 'ProcessDataVariable';

const deviceElement = require('./deviceElement');
const product = require('./product');
const valuePresentation = require('./valuePresentation');

/*
*
* A ProcessDataDDI
* B ProcessDataValue
* C ProductIdRef
* D DeviceElementIdRef
* E ValuePresentationIdRef
* F ActualCulturalPracticeValue
* G ElementTypeInstanceValue
* 
* ProcessDataVariable
*
*/

const processDataVariable = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};

/**
 * This function maps an NGSI object to an ISOXML PDV
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'ddi');
    FMIS.addAttribute(attr, entity, 'B', 'value');
    FMIS.addRelationship(attr, entity, 'C', 'productIdRef', product.isoxmlType);
    FMIS.addRelationship(attr, entity, 'D', 'deviceElementIdRef', deviceElement.isoxmlType);
    FMIS.addRelationship(attr, entity, 'E', 'valuePresentationIdRef', valuePresentation.isoxmlType);
    FMIS.addAttribute(attr, entity, 'F', 'actualCulturalPracticeValue');
    FMIS.addAttribute(attr, entity, 'G', 'elementTypeInstanceValue');
    return xml;
}

/**
 * This function maps an ISOXML PDV to an NGSI object
 */
function transformMICS(entity) {
    MICS.addProperty(entity, 'A', 'ddi', schema.TEXT, false);
    MICS.addInt(entity, 'B', 'value', schema.NUMBER, false);
    MICS.addRelationship(entity, 'C', 'productIdRef', product.ngsiType, false);
    MICS.addRelationship(entity, 'D', 'deviceElementIdRef', deviceElement.ngsiType, false);
    MICS.addRelationship(entity, 'E', 'valuePresentationIdRef', valuePresentation.ngsiType, false);
    MICS.addInt(entity, 'F', 'actualCulturalPracticeValue', schema.NUMBER, false);
    MICS.addInt(entity, 'G', 'elementTypeInstanceValue', schema.NUMBER, false);

    MICS.addArray(entity, processDataVariable, 'processDataVariable');

    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML PDV
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'productIdRef');
    transforms.addReference(refs, entity, 'deviceElementIdRef');
    transforms.addReference(refs, entity, 'valuePresentationIdRef');
    return refs;
}

module.exports = processDataVariable;
