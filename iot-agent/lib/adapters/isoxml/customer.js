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

const isoxmlType = 'CTR';
const ngsiType = 'Person';

/*
A CustomerId
B CustomerLastName
C CustomerFirstName
D CustomerStreet
E CustomerPOBox
F CustomerPostalCode
G CustomerCity
H CustomerState
I CustomerCountry
J CustomerPhone
K CustomerMobile
L CustomerFax
M CustomerEMail
*/

/**
 * This function maps an NGSI object to an ISOXML CTR
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'familyName');
    FMIS.addAttribute(attr, entity, 'C', 'givenName');
    FMIS.addAddressAttribute(attr, entity, 'D', 'address');
    FMIS.addAttribute(attr, entity, 'J', 'telephone');
    FMIS.addAttribute(attr, entity, 'K', 'mobile');
    FMIS.addAttribute(attr, entity, 'L', 'licenseNumber');
    FMIS.addAttribute(attr, entity, 'M', 'eMail');
    return xml;
}

/**
 * This function maps an ISOXML CTR to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addProperty(entity, 'B', 'familyName', schema.TEXT, normalized);
    MICS.addProperty(entity, 'C', 'givenName', schema.TEXT, normalized);
    MICS.addAddressProperty(entity, 'D', 'address', schema.POSTAL_ADDRESS, normalized);
    MICS.addProperty(entity, 'J', 'telephone', schema.TEXT, normalized);
    MICS.addProperty(entity, 'K', 'mobile', schema.TEXT, normalized);
    MICS.addProperty(entity, 'L', 'licenseNumber', schema.TEXT, normalized);
    MICS.addProperty(entity, 'M', 'eMail', schema.TEXT, normalized);
    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
