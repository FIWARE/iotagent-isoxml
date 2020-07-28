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

const fs = require('fs');
const path = require('path');
const transforms = require('./transforms');

const FMIS = {
    resetIndex: transforms.FMIS.resetIndex
};
const MICS = {};
const NGSI = {};
const Relationships = {};

const bindings = fs.readdirSync(path.join(__dirname, './isoxml'));
const overrideBindings = fs.readdirSync(path.join(__dirname, '../../conf'));

bindings.forEach(function (item) {
    const isoxml = require('./isoxml/' + item);

    if (isoxml.isoxmlType) {
        const type = isoxml.isoxmlType.toLowerCase();
        MICS[type] = isoxml.transformMICS;
        FMIS[type] = isoxml.transformFMIS;
        Relationships[type] = isoxml.relationships;
        NGSI[type] = isoxml.ngsiType;
    }
});

overrideBindings.forEach(function (item) {
    const isoxml = require('../../conf/' + item);

    if (isoxml.isoxmlType) {
        const type = isoxml.isoxmlType.toLowerCase();
        MICS[type] = isoxml.transformMICS;
        FMIS[type] = isoxml.transformFMIS;
        Relationships[type] = isoxml.relationships;
        NGSI[type] = isoxml.ngsiType;
    }
});

module.exports = {
    NGSI,
    FMIS,
    MICS,
    Relationships
};
