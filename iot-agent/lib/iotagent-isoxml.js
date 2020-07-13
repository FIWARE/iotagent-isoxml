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
const async = require('async');
const apply = async.apply;
const context = {
    op: 'IoTA-ISOXML.Agent'
};
const config = require('./configService');
const iotaUtils = require('./iotaUtils');
const transportSelector = require('./transportSelector');

const dynamicFunctions = require('./plugins/dynamicFunctionsPlugin');
const attributeDelete = require('./plugins/attributeDeletePlugin');

/**
 * Calls all the device provisioning handlers for each transport protocol binding whenever a new device is provisioned
 * in the Agent.
 *
 * @param {Object} device           Device provisioning information.
 */
function deviceProvisioningHandler(device, callback) {
    transportSelector.applyFunctionFromBinding([device], 'deviceProvisioningHandler', null, function(error, devices) {
        if (error) {
            callback(error);
        } else {
            callback(null, devices[0]);
        }
    });
}

/**
 * Calls all the configuration provisioning handlers for each transport protocol binding whenever a new configuration
 * is provisioned in the Agent.
 *
 * @param {Object} configuration     Configuration provisioning information.
 */
function configurationHandler(configuration, callback) {
    transportSelector.applyFunctionFromBinding([configuration], 'configurationHandler', null, callback);
}

/**
 * Calls all the command execution handlers for each transport protocol binding whenever a new command execution request
 * arrives from the Context Broker.
 *
 * @param {String} id               ID of the entity for which the command execution was issued.
 * @param {String} type             Type of the entity for which the command execution was issued.
 * @param {Array} attributes        List of NGSI attributes of type command to execute.
 */
function commandHandler(id, type, service, subservice, attributes, callback) {
    iotAgentLib.getDeviceByName(id, service, subservice, function(error, device) {
        if (error) {
            config.getLogger().error(
                context,
                /*jshint quotmark: double */
                "COMMANDS-001: Command execution could not be handled, as device for entity [%s] [%s] wasn't found",
                /*jshint quotmark: single */
                id,
                type
            );
            callback(error);
        } else {
            transportSelector.applyFunctionFromBinding(
                [device, attributes],
                'commandHandler',
                device.transport || config.getConfig().defaultTransport,
                callback
            );
        }
    });
}

/**
 * Handler for incoming notifications for the configuration subscription mechanism.
 *
 * @param {Object} device           Object containing all the device information.
 * @param {Array} updates           List of all the updated attributes.

 */
function configurationNotificationHandler(device, updates, callback) {
    function invokeConfiguration(apiKey, callback) {
        transportSelector.applyFunctionFromBinding(
            [apiKey, device.id, updates],
            'sendConfigurationToDevice',
            device.transport || config.getConfig().defaultTransport,
            callback
        );
    }

    async.waterfall(
        [apply(iotaUtils.getEffectiveApiKey, device.service, device.subservice, device), invokeConfiguration],
        callback
    );
}

/**
 * Calls all the command execution handlers for each transport protocol binding whenever a new notification request
 * arrives from the Context Broker.
 *
 * @param {Object} device               Device data object containing all stored information about the device.
 * @param {Array} values                Values recieved in the notification.
 */
function notificationHandler(device, values, callback) {
    transportSelector.applyFunctionFromBinding(
        [device, values],
        'notificationHandler',
        device.transport || config.getConfig().defaultTransport,
        callback
    );
}

/**
 * Handles incoming updateContext requests related with lazy attributes. This handler is still just registered,
 * but empty.
 *
 * @param {String} id               ID of the entity for which the update was issued.
 * @param {String} type             Type of the entity for which the update was issued.
 * @param {Array} attributes        List of NGSI attributes to update.
 */
function updateHandler(id, type, attributes, service, subservice, callback) {
    callback();
}

/**
 * Starts the IOTA with the given configuration.
 *
 * @param {Object} newConfig        New configuration object.
 */
function start(newConfig, callback) {
    const options = {
        keepalive: 0,
        connectTimeout: 60 * 60 * 1000
    };

    config.setLogger(iotAgentLib.logModule);
    config.setConfig(newConfig);

    iotAgentLib.activate(config.getConfig().iota, function(error) {
        if (error) {
            callback(error);
        } else {
            config.getLogger().info(context, 'IoT Agent services activated');

            iotAgentLib.setProvisioningHandler(deviceProvisioningHandler);
            iotAgentLib.setConfigurationHandler(configurationHandler);
            iotAgentLib.setCommandHandler(commandHandler);
            iotAgentLib.setDataUpdateHandler(updateHandler);

            iotAgentLib.addUpdateMiddleware(dynamicFunctions.update);
            iotAgentLib.addUpdateMiddleware(attributeDelete.update);
            iotAgentLib.addUpdateMiddleware(iotAgentLib.dataPlugins.timestampProcess.update);

            transportSelector.startTransportBindings(newConfig, callback);
        }
    });
}

/**
 * Stops the current IoT Agent.
 *
 */
function stop(callback) {
    config.getLogger().info(context, 'Stopping IoT Agent: ');
    async.series(
        [transportSelector.stopTransportBindings, iotAgentLib.resetMiddlewares, iotAgentLib.deactivate],
        function() {
            config.getLogger().info('Agent stopped');
            callback();
        }
    );
}

exports.start = start;
exports.stop = stop;
