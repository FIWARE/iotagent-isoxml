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
const xml = require('xml');

const isoxmlPrefix =
    '<ISO11783_TaskData TaskControllerVersion="" VersionMinor="1" ManagementSoftwareManufacturer="Topcon Precision Agriculture" DataTransferOrigin="2" ManagementSoftwareVersion="1.0" TaskControllerManufacturer="" VersionMajor="4" >';

const isoxmlPostfix = '</ISO11783_TaskData>';

function readJSON(name) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return JSON.parse(text);
}

function readXML(name) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return text;
}

function readISOXML(name) {
    const xml = readXML(name);
    return isoxmlPrefix + xml + isoxmlPostfix;
}

function convertToXML(xmlObject) {
    return xml(xmlObject, {});
}

exports.readJSON = readJSON;
exports.readXML = readXML;
exports.convertToXML = convertToXML;
exports.readISOXML = readISOXML;
