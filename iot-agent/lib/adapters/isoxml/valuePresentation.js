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

const isoxmlType = 'VPN';
const ngsiType = 'Value';

const colourLegend = require('./colourLegend');

/*
*
* A ValuePresentationId
* B Offset
* C Scale
* D NumberOfDecimals
* E UnitDesignator
* F ColourLegendIdRef
*
*/

/**
 * This function maps an NGSI object to an ISOXML VPN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'offset');
    FMIS.addAttribute(attr, entity, 'C', 'scale');
    FMIS.addAttribute(attr, entity, 'D', 'numberOfDecimals');
    FMIS.addAttribute(attr, entity, 'E', 'unit');
    FMIS.addRelationship(attr, entity, 'F', 'colourLegendIdRef', colourLegend.isoxmlType);

    return xml;
}

/**
 * This function maps an ISOXML VPN to an NGSI object
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, ngsiType);
    }
    MICS.addFloat(entity, 'B', 'offset', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'C', 'scale', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'D', 'numberOfDecimals', schema.NUMBER, normalized);
    MICS.addProperty(entity, 'E', 'unit', schema.TEXT, normalized);
    MICS.addRelationship(entity, 'F', 'colourLegendIdRef', colourLegend.ngsiType, normalized);
    return entity;
}

/*
*    This function lists the reference relationships of an ISOXML VPN
*/
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'colourLegendIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
