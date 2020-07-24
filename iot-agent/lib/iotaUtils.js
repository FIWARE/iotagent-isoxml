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

const iotAgentLib = require('iotagent-node-lib');
const errors = require('./errors');
const _ = require('underscore');
const context = {
    op: 'IOTA.ISOXML.IoTUtils'
};
const async = require('async');
const apply = async.apply;
const config = require('./configService');
const transforms = require('./adapters/transforms');
const adapter = require('./adapters/adapter');

/**
 * Get the API Key for the selected service if there is any, or the default API Key if a specific one does not exist.
 *
 * @param {String} service          Name of the service whose API Key we are retrieving.
 * @param {String} subservice       Name of the subservice whose API Key we are retrieving.
 * @param {Json} device             Device object.
 */
function getEffectiveApiKey(service, subservice, device, callback) {
    config.getLogger().debug(context, 'Getting effective API Key');

    if (device && device.apikey) {
        config.getLogger().debug('Using device apikey: %s', device.apikey);
        callback(null, device.apikey);
    } else {
        iotAgentLib.findConfiguration(service, subservice, function (error, group) {
            if (group) {
                config.getLogger().debug('Using found group: %j', group);
                callback(null, group.apikey);
            } else if (config.getConfig().defaultKey) {
                config.getLogger().debug('Using default API Key: %s', config.getConfig().defaultKey);
                callback(null, config.getConfig().defaultKey);
            } else {
                config.getLogger().error(context, 'COMMANDS-002: Could not find any API Key information for device.');
                callback(new errors.GroupNotFound(service, subservice));
            }
        });
    }
}

function findOrCreate(deviceId, transport, group, callback) {
    iotAgentLib.getDevice(deviceId, group.service, group.subservice, function (error, device) {
        if (!error && device) {
            callback(null, device, group);
        } else if (error.name === 'DEVICE_NOT_FOUND') {
            const newDevice = {
                id: deviceId,
                service: group.service,
                subservice: group.subservice,
                type: group.type,
                name: deviceId
            };

            // Fix transport depending on binding
            if (!newDevice.transport) {
                newDevice.transport = transport;
            }

            if ('timestamp' in group) {
                newDevice.timestamp = group.timestamp;
            }

            iotAgentLib.register(newDevice, function (err, registeredDevice) {
                callback(err, registeredDevice, group);
            });
        } else {
            callback(error);
        }
    });
}

function mergeArrays(original, newArray) {
    /* jshint camelcase: false */
    const originalKeys = _.pluck(original, 'object_id');
    const newKeys = _.pluck(newArray, 'object_id');
    const addedKeys = _.difference(newKeys, originalKeys);
    const differenceArray = newArray.filter(function (item) {
        return addedKeys.indexOf(item.object_id) >= 0;
    });

    return original.concat(differenceArray);
}

/**
 * If the object_id or the name of the attribute is missing, complete it with the other piece of data.
 *
 * @param {Object} attribute            Device attribute
 * @return {*}                          Completed attribute
 */
function setDefaultAttributeIds(attribute) {
    /* jshint camelcase: false */

    if (!attribute.object_id && attribute.name) {
        attribute.object_id = attribute.name;
    }

    if (!attribute.name && attribute.object_id) {
        attribute.name = attribute.object_id;
    }

    return attribute;
}

/**
 * Complete the information of the device with the information in the configuration group (with precedence of the
 * device).
 *
 * @param {Object} deviceData           Device data.
 * @param {Object} configuration        Configuration data.
 */
function mergeDeviceWithConfiguration(deviceData, configuration, callback) {
    const fields = ['lazy', 'internalAttributes', 'active', 'staticAttributes', 'commands', 'subscriptions'];
    const defaults = [null, null, [], [], [], [], []];

    for (let i = 0; i < fields.length; i++) {
        const confField = fields[i] === 'active' ? 'attributes' : fields[i];

        if (deviceData[fields[i]] && configuration && configuration[confField]) {
            deviceData[fields[i]] = mergeArrays(deviceData[fields[i]], configuration[confField]);
        } else if (!deviceData[fields[i]] && configuration && configuration[confField]) {
            deviceData[fields[i]] = configuration[confField];
        } else if (!deviceData[fields[i]] && (!configuration || !configuration[confField])) {
            deviceData[fields[i]] = defaults[i];
        }

        if (deviceData[fields[i]] && ['active', 'lazy', 'commands'].indexOf(fields[i]) >= 0) {
            deviceData[fields[i]] = deviceData[fields[i]].map(setDefaultAttributeIds);
        }
    }

    callback(null, deviceData);
}

/**
 * Retrieve a device from the device repository based on the given APIKey and DeviceID, creating one if none is
 * found for the given data.
 *
 * @param {String} deviceId         Device ID of the device that wants to be retrieved or created.
 * @param {String} apiKey           APIKey of the Device Group (or default APIKey).
 */
function retrieveDevice(deviceId, apiKey, transport, callback) {
    const effectiveId = adapter.NGSI[apiKey] ? transforms.generateURI(deviceId, adapter.NGSI[apiKey]) : deviceId;
    async.waterfall(
        [
            apply(iotAgentLib.getConfiguration, config.getConfig().iota.defaultResource, apiKey),
            apply(findOrCreate, effectiveId, transport),
            mergeDeviceWithConfiguration
        ],
        callback
    );
}

/**
 * Update the result of a command with the information given by the client.
 *
 * @param {String} apiKey           API Key corresponding to the Devices configuration.
 * @param {Object} device           Device object containing all the information about a device.
 * @param {String} message          UL payload.
 * @param {String} command          Command name.
 * @param {String} status           End status of the command.
 */
function updateCommand(apiKey, device, message, command, status, callback) {
    iotAgentLib.setCommandResult(
        device.name,
        config.getConfig().iota.defaultResource,
        apiKey,
        command,
        message,
        status,
        device,
        function (error) {
            if (error) {
                config.getLogger().error(
                    context,
                    /*jshint quotmark: double */
                    "COMMANDS-003: Couldn't update command status in the Context broker for device [%s]" +
                        /*jshint quotmark: single */
                        ' with apiKey [%s]: %s',
                    device.id,
                    apiKey,
                    error
                );

                callback(error);
            } else {
                config
                    .getLogger()
                    .debug(
                        context,
                        'Single measure for device [%s] with apiKey [%s] successfully updated',
                        device.id,
                        apiKey
                    );

                callback();
            }
        }
    );
}

function manageConfiguration(apiKey, deviceId, device, objMessage, sendFunction, callback) {
    /* eslint-disable-next-line no-unused-vars */
    function handleSendConfigurationError(error, results) {
        if (error) {
            config.getLogger().error(
                context,
                /*jshint quotmark: double */
                "CONFIG-001: Couldn't get the requested values from the Context Broker: %s",
                /*jshint quotmark: single */
                error
            );
        } else {
            config
                .getLogger()
                .debug(context, 'Configuration attributes sent to the device successfully.', deviceId, apiKey);
        }

        callback(error);
    }

    function extractAttributes(results, callbackFn) {
        if (
            results.contextResponses &&
            results.contextResponses[0] &&
            results.contextResponses[0].contextElement.attributes
        ) {
            callbackFn(null, results.contextResponses[0].contextElement.attributes);
        } else {
            /*jshint quotmark: double */
            callbackFn("Couldn't find any information in Context Broker response");
            /*jshint quotmark: single */
        }
    }

    if (objMessage.type === 'configuration') {
        async.waterfall(
            [
                apply(iotAgentLib.query, device.name, device.type, '', objMessage.attributes, device),
                extractAttributes,
                apply(sendFunction, apiKey, deviceId)
            ],
            handleSendConfigurationError
        );
    } else if (objMessage.type === 'subscription') {
        iotAgentLib.subscribe(device, objMessage.attributes, objMessage.attributes, function (err) {
            if (err) {
                config
                    .getLogger()
                    .error(
                        context,
                        'CONFIG-002: There was an error subscribing device [%s] to attributes [%j]',
                        device.name,
                        objMessage.attributes
                    );
            } else {
                config
                    .getLogger()
                    .debug(
                        context,
                        'Successfully subscribed device [%s] to attributes[%j]',
                        device.name,
                        objMessage.fields
                    );
            }

            callback(err);
        });
    } else {
        config
            .getLogger()
            .error(context, 'CONFIG-003: Unknown command type from device [%s]: %s', device.name, objMessage.type);
        callback();
    }
}

exports.getEffectiveApiKey = getEffectiveApiKey;
exports.manageConfiguration = manageConfiguration;
exports.retrieveDevice = retrieveDevice;
exports.updateCommand = updateCommand;
