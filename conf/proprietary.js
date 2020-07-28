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

const transforms = require('../lib/adaptors/transforms');
const transforms = require('../lib/adaptors/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'P500_MyElement';
const ngsiType = 'CustomEntity';

/*

This is just a sample custom message  <P500_MyElement> to be processed.
It contains the following attributes which are mapped to an NGSI entity
as shown.

P500_A - id
P500_B - customAttribute


<P500_MyElement P500_A="xxx1" P500_B="yyy"/> 


{
    "id": "urn:ngsi-ld:CustomEntity:xxx1",
    "type": "CustomEntity",
    "isoxml_type": "P500_MyElement",
    "customAttribute": "yyy"
}


*/

/**
 * This function maps an NGSI "CustomEntity" to an ISOXML P500_MyElement
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType, 'P500_A');
    FMIS.addAttribute(attr, entity, 'P500_B', 'customAttribute');
    return xml;
}

/**
 * This function maps an ISOXML P500_MyElement to an NGSI CustomEntity
 */
function transformMICS(entity, normalized) {
    if (entity['P500_A'] && !normalized) {
        entity.id = transforms.generateURI(entity.A, isoxmlType);
    }
    MICS.addProperty(entity, 'P500_B', 'customAttribute', schema.TEXT, normalized);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
