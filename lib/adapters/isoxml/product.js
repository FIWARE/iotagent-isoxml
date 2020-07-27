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

const productGroup = require('./productGroup');
const productRelation = require('./productRelation');
const valuePresentation = require('./valuePresentation');

const isoxmlType = 'PDT';
const ngsiType = 'Product';

/*
A id
B name
C productGroupIdRef
D valuePresentationIdRef
E QuantityDDI
F ProductType
	 1 Single
	 2 Mixture
	 3 TemporaryMixture
G MixtureRecipeQuantity
H DensityMassPerVolume
I DensityMassPerCount
J DensityVolumePerCount


ProductRelation

*/

const PRODUCT_TYPES = {
    '1': 'Single',
    '2': 'Mixture',
    '3': 'TemporaryMixture'
};

/**
 * This function maps an NGSI object to an ISOXML PDT
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addAttribute(attr, entity, 'A', 'id');
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addRelationship(attr, entity, 'C', 'productGroupIdRef', productGroup.isoxmlType);
    FMIS.addRelationship(attr, entity, 'D', 'valuePresentationIdRef', valuePresentation.isoxmlType);
    FMIS.addAttribute(attr, entity, 'E', 'quantityDDI');
    FMIS.addAttribute(attr, entity, 'F', 'productType');
    FMIS.addAttribute(attr, entity, 'G', 'mixtureRecipeQuantity');
    FMIS.addAttribute(attr, entity, 'H', 'densityMassPerVolume');
    FMIS.addAttribute(attr, entity, 'I', 'densityMassPerCount');
    FMIS.addAttribute(attr, entity, 'J', 'densityVolumePerCount');
    return xml;
}

/**
 * This function maps an ISOXML PDT to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, isoxmlType);
    }

    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addRelationship(entity, 'C', 'productGroupIdRef', productGroup.ngsiType, normalized);
    MICS.addRelationship(entity, 'D', 'valuePresentationIdRef', valuePresentation.ngsiType, normalized);
    MICS.addProperty(entity, 'E', 'quantityDDI', schema.TEXT, normalized);
    MICS.addMappedProperty(entity, 'F', 'productType', schema.TEXT, PRODUCT_TYPES, normalized);
    MICS.addInt(entity, 'G', 'mixtureRecipeQuantity', schema.NUMBER, normalized);
    MICS.addInt(entity, 'H', 'densityMassPerVolume', schema.NUMBER, normalized);
    MICS.addInt(entity, 'I', 'densityMassPerCount', schema.NUMBER, normalized);
    MICS.addInt(entity, 'J', 'densityVolumePerCount', schema.NUMBER, normalized);

    MICS.addArray(entity, productRelation, 'productRelation', normalized);

    return entity;
}

function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'productGroupIdRef');
    transforms.addReference(refs, entity, 'valuePresentationIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    relationships,
    ngsiType
};
