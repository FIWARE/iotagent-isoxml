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

/* eslint-disable no-unused-vars */

const errors = require('./errors');
const constants = require('./constants');
const config = require('./configService');
const xmlToJson = require('xml-parser');
const JsonToXml = require('xml');
const fmisAdapter = require('./adapters/adapter').FMIS;
const context = {
    op: 'IOTA.ISOXML.Parser'
};
const _ = require('underscore');

/**
 * Parse a measure reporting payload, returning an array with all the measure groups restructured as objects. Throws
 * an error if the syntax is not correct.
 *
 * @param {String} payload         XML measure reporting payload
 * @return {Array}                 Array containing an object per measure group
 */
function parse(payload) {
    config.getLogger().debug(context, 'parse', JSON.stringify(payload));

    function removeDollars(payload) {
        if (Array.isArray(payload)) {
            return payload.map((elem) => removeDollars(elem));
        }
        const keys = Object.keys(payload);
        const result = payload.$;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== '$') {
                if (Array.isArray(payload[keys[i]])) {
                    result[keys[i]] = payload[keys[i]].map((elem) => removeDollars(elem));
                } else {
                    result[keys[i]] = removeDollars(payload[keys[i]]);
                }
            }
        }
        return result;
    }
    return removeDollars(payload);
}

/**
 * Parse a command result payload, returning an object containing information about the command result. Throws
 * an error if the syntax is not correct.
 *
 * The returned object contains three attributes:
 * - deviceId: ID of the device executing the command.
 * - command: name of the command to execute.
 * - result: a string representing the output of the command.
 *
 * @param {String} payload         XML command result payload
 * @return {Object}                Object containing the result information
 */

function result(payload) {
    const data = xmlToJson(payload);
    const result = {};

    config.getLogger().debug(context, 'result', JSON.stringify(payload));
    result.deviceId = data.root.attributes.device;
    result.command = data.root.attributes.command;
    result.result = data.root.name;

    return result;
}

/**
 * Creates the command payload string, based on the device information and command attributes.
 *
 * @param {Object} device           Object containing all the information about a device.
 * @param {String} command          Name of the command to execute.
 * @param {Object} attributes       Object containing the command parameters as attributes of the object.
 * @return {String}                 String with the codified command.
 */
function createCommandPayload(device, command, attributes, entities) {
    config.getLogger().debug(context, 'createCommandPayload');

    const root = { isoxml: [] };
    const isoxmlType = config.getConfig().isoxmlType || constants.DEFAULT_ISOXML_TYPE;

    Object.keys(entities).forEach((key) => {
        const entity = entities[key];
        if (entity[isoxmlType]) {
            fmisAdapter.resetIndex();
            const transform = fmisAdapter[entity[isoxmlType].toLowerCase()];

            if (typeof transform === 'function') {
                root.isoxml.push(transform(entity));
            }
        }
    });
    return JsonToXml(root);
}

exports.parse = parse;
exports.result = result;
exports.createCommandPayload = createCommandPayload;
