/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[iot_support@tid.es]
 */

/* eslint-disable no-unused-vars */

const errors = require("./errors");
const constants = require("./constants");
const config = require("./configService");
const xmlToJson = require("xml-parser");
const context = {
  op: "IOTA.ISOXML.XMLParser"
};
const _ = require("underscore");

/**
 * Parse a command execution payload, returning an object containing information about the command. Throws
 * an error if the syntax is not correct.
 *
 * The returned object contains three attributes:
 * - deviceId: ID of the device executing the command.
 * - command: name of the command to execute.
 * - params: object containing the parameters to the command in map format.
 *
 * @param {String} payload         XML command execution payload
 * @return {Object}                Object containing the command information
 */
function command(payload) {
  config.getLogger().debug(context, "Command ", payload);
  return {};
}

/**
 * Parse a measure reporting payload, returning an array with all the measure groups restructured as objects. Throws
 * an error if the syntax is not correct.
 *
 * @param {String} payload         XML measure reporting payload
 * @return {Array}                 Array containing an object per measure group
 */

/////////////////////////////////////////////////////////////////////////
//
// Amended Function - extracts measure attributes from the XML Payload
//
function parse(payload) {
  const result = [];
  config.getLogger().debug(context, "parse", payload);
  const keys = Object.keys(payload.measure);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== "$") {
      const obj = {};
      obj[keys[i]] = payload.measure[keys[i]].$.value;
      result.push(obj);
    }
  }
  return result;
}
/////////////////////////////////////////////////////////////////////////

function parseConfigurationRequest(payload) {
  config.getLogger().debug(context, "parseConfigurationRequest", payload);
  return {};
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

/////////////////////////////////////////////////////////////////////////
//
// Amended Function - extracts command result info from the XML
//
function result(payload) {
  const data = xmlToJson(payload);
  const result = {};

  config.getLogger().debug(context, "result", JSON.stringify(payload));
  result.deviceId = data.root.attributes.device;
  result.command = data.root.attributes.command;
  result.result = data.root.name;

  return result;
}
/////////////////////////////////////////////////////////////////////////

/**
 * Creates the command payload string, based on the device information and command attributes.
 *
 * @param {Object} device           Object containing all the information about a device.
 * @param {String} command          Name of the command to execute.
 * @param {Object} attributes       Object containing the command parameters as attributes of the object.
 * @return {String}                 String with the codified command.
 */

/////////////////////////////////////////////////////////////////////////
//
// Amended Function - creates a custom XML command payload
//
function createCommandPayload(device, command, attributes) {
  config.getLogger().debug(context, "createCommandPayload");

  if (typeof attributes === "object") {
    let payload = "<" + command + '  device="' + device.id + '">';

    Object.keys(attributes).forEach(function(key, value) {
      payload = payload + "<" + key + ">" + value + "</" + key + ">";
    });
    payload = payload + "</" + command + ">";
    return payload;
  }
  return "<" + command + '  device="' + device.id + '"/>';
}
/////////////////////////////////////////////////////////////////////////

/**
 * Creates the configuration payload string, based on the device information.
 *
 * @param {Object} device           Object containing all the information about a device.
 * @param {Object} attributes       Object containing the command parameters as attributes of the object.
 * @return {String}                 String with the codified command.
 */
function createConfigurationPayload(deviceId, attributes) {
  config.getLogger().debug(context, "createConfigurationPayload");
  return "createConfigurationPayload";
}

exports.parse = parse;
exports.parseConfigurationRequest = parseConfigurationRequest;
exports.command = command;
exports.result = result;
exports.createCommandPayload = createCommandPayload;
exports.createConfigurationPayload = createConfigurationPayload;
