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

const http = require('http');
const async = require('async');
const apply = async.apply;
const iotAgentLib = require('iotagent-node-lib');
const _ = require('underscore');
const intoTrans = iotAgentLib.intoTrans;
const express = require('express');
const utils = require('../iotaUtils');
const xmlBodyParser = require('express-xml-bodyparser');
const constants = require('../constants');
const commonBindings = require('./../commonBindings');
const errors = require('../errors');
const xmlParser = require('../xmlParser');
let httpBindingServer;
const request = require('request');
const config = require('../configService');
const context = {
    op: 'IOTA.ISOXML.HTTP.Binding'
};
const transport = 'HTTP';

/* eslint-disable-next-line no-unused-vars */
function handleError(error, req, res, next) {
    let code = 500;

    config.getLogger().debug(context, 'Error [%s] handing request: %s', error.name, error.message);

    if (error.code && String(error.code).match(/^[2345]\d\d$/)) {
        code = error.code;
    }

    res.status(code).json({
        name: error.name,
        message: error.message
    });
}

function parseData(req, res, next) {
    const data = [];
    let error;
    const payload = req.iso11783_taskdata;

    config.getLogger().debug(context, 'Parsing payload [%s]', JSON.stringify(payload));

    try {
        Object.keys(payload).forEach((key) => {
            if (key === '$') {
                return;
            }
            const obj = {};
            obj[key] = xmlParser.parse(payload[key]);
            data.push(obj);
        });
    } catch (e) {
        error = e;
    }

    if (error) {
        next(error);
    } else {
        req.isoxmlData = data;

        config.getLogger().debug(context, 'Parsed data: [%j]', JSON.stringify(data));
        next();
    }
}

function addTimestamp(req, res, next) {
    if (req.query.t && req.ulPayload) {
        for (let i = 0; i < req.ulPayload.length; i++) {
            req.ulPayload[i][constants.TIMESTAMP_ATTRIBUTE] = req.query.t;
        }
    }

    next();
}

function checkMandatoryParams(req, res, next) {
    const notFoundParams = [];
    let error;
    req.iso11783_taskdata = req.body.iso11783_taskdata;

    if (!req.iso11783_taskdata) {
        notFoundParams.push('ISOXML Task');
    } else {
        Object.keys(req.iso11783_taskdata).forEach((key) => {
            if (key === '$') {
                return;
            }
            const entity = req.iso11783_taskdata[key];
            if (Array.isArray(entity)) {
                entity.forEach((element) => {
                    const entityId = element.$ ? element.$.A : null;
                    if (!entityId) {
                        notFoundParams.push('Id for Entity: ' + key);
                    }
                });
            } else {
                const entityId = entity.$ ? entity.$.A : null;
                if (!entityId) {
                    notFoundParams.push('Id for Entity: ' + key);
                }
            }
        });
    }

    if (req.method === 'POST' && !req.is('application/xml')) {
        error = new errors.UnsupportedType('application/xml');
    }

    if (notFoundParams.length !== 0) {
        next(new errors.MandatoryParamsNotFound(notFoundParams));
    } else {
        next(error);
    }
}

/////////////////////////////////////////////////////////////////////////

/**
 * This middleware checks whether there is any polling command pending to be sent to the device. If there is some,
 * add the command information to the return payload. Otherwise it returns an empty payload.
 */

/* eslint-disable-next-line no-unused-vars */
function returnCommands(req, res, next) {
    function updateCommandStatus(device, commandList) {
        function createCommandUpdate(command) {
            return apply(
                iotAgentLib.setCommandResult,
                device.name,
                device.resource,
                req.query.k,
                command.name,
                ' ',
                'DELIVERED',
                device
            );
        }

        function cleanCommand(command) {
            return apply(iotAgentLib.removeCommand, device.service, device.subservice, device.id, command.name);
        }

        const updates = commandList.map(createCommandUpdate);
        const cleanCommands = commandList.map(cleanCommand);

        /* eslint-disable-next-line no-unused-vars */
        async.parallel(updates.concat(cleanCommands), function(error, results) {
            if (error) {
                // prettier-ignore
                config.getLogger().error(
                    context,
                    'Error updating command status after delivering commands for device [%s]',
                    device.id
                );
            } else {
                // prettier-ignore
                config.getLogger().debug(
                    context,
                    'Command status updated successfully after delivering command list to device [%s]',
                    device.id
                );
            }
        });
    }

    function parseCommand(item) {
        return xmlParser.createCommandPayload(req.device, item.name, item.value);
    }

    function concatCommand(previous, current) {
        if (previous === '') {
            return current;
        }
        return previous + '|' + current;
    }

    if (req.query && req.query.getCmd === '1') {
        iotAgentLib.commandQueue(req.device.service, req.device.subservice, req.deviceId, function(error, list) {
            if (error || !list || list.count === 0) {
                res.status(200).send('');
            } else {
                res.status(200).send(list.commands.map(parseCommand).reduce(concatCommand, ''));

                process.nextTick(updateCommandStatus.bind(null, req.device, list.commands));
            }
        });
    } else {
        res.status(200).send('');
    }
}

function handleIncomingMeasure(req, res, next) {
    res.locals.errors = [];
    // prettier-ignore
    config.getLogger().debug('Processing ISOXML data');

    function processHTTPWithDevice(device, data, apiKey, callback) {
        const attributes = [];
        Object.keys(data).forEach((key) => {
            if (key !== 'A') {
                attributes.push({ name: key, value: data[key], type: 'string' });
            }
        });
        iotAgentLib.update(device.name, device.type, apiKey, attributes, device, function(error) {
            if (error) {
                res.locals.errors.push(error);
                // prettier-ignore
                config.getLogger().error(
                    context,
                    "MEASURES-002: Couldn't send the updated values to the Context Broker due to an error: %s",
                    JSON.stringify(error)
                );
            } else {
                // prettier-ignore
                config.getLogger().debug(
                    context,
                    'Multiple measures for device [%s] with apiKey [%s] successfully updated',
                    device.id,
                    apiKey
                );
            }
            callback();
        });
    }

    function processDeviceMeasure(item, callback) {
        utils.retrieveDevice(item.id, item.apiKey, transport, (error, device) => {
            if (error) {
                error.message += ': ' + item.apiKey;
                res.locals.errors.push(error);
                callback();
            } else {
                const localContext = _.clone(context);
                localContext.service = device.service;
                localContext.subservice = device.subservice;
                intoTrans(localContext, processHTTPWithDevice)(device, item.data, item.apiKey, callback);
            }
        });
    }

    const measures = [];
    req.isoxmlData.forEach((element) => {
        const apiKey = _.keys(element)[0];
        if (Array.isArray(element[apiKey])) {
            element[apiKey].forEach((item) => {
                measures.push({ id: item.A, data: item, apiKey });
            });
        } else {
            measures.push({ id: element[apiKey].A, data: element[apiKey], apiKey });
        }
    });

    async.map(measures, processDeviceMeasure, (error) => {
        if (res.locals.errors.length === 0) {
            return next();
        } if (res.locals.errors.length === 1 && measures.length === 1) {
            return next(res.locals.errors[0]);
        } else if (res.locals.errors.length  === measures.length){
            return res.status(400).send(res.locals.errors);
        }
        // Partial success...
        return res.status(202).send(res.locals.errors);
    });
}

/**
 * Generate a function that executes the given command in the device.
 *
 * @param {String} apiKey           APIKey of the device's service or default APIKey.
 * @param {Object} device           Object containing all the information about a device.
 * @param {Object} attribute        Attribute in NGSI format.
 * @return {Function}               Command execution function ready to be called with async.series.
 */
function generateCommandExecution(apiKey, device, attribute) {
    const cmdName = attribute.name;
    const cmdAttributes = attribute.value;
    const options = {
        url: device.endpoint,
        method: 'POST',
        body: xmlParser.createCommandPayload(device, cmdName, cmdAttributes),
        headers: {
            'fiware-service': device.service,
            'fiware-servicepath': device.subservice
        }
    };

    if (config.getConfig().http.timeout) {
        options.timeout = config.getConfig().http.timeout;
    }

    return function sendXMLCommandHTTP(callback) {
        let commandObj;

        request(options, function(error, response, body) {
            if (error) {
                callback(new errors.HTTPCommandResponseError('', error, cmdName));
            } else if (response.statusCode !== 200) {
                let errorMsg;

                try {
                    commandObj = xmlParser.result(body);
                    errorMsg = commandObj.result;
                } catch (e) {
                    errorMsg = body;
                }

                callback(new errors.HTTPCommandResponseError(response.statusCode, errorMsg, cmdName));
            } else if (apiKey) {
                commandObj = xmlParser.result(body);

                process.nextTick(
                    utils.updateCommand.bind(
                        null,
                        apiKey,
                        device,
                        commandObj.result,
                        commandObj.command,
                        constants.COMMAND_STATUS_COMPLETED,
                        callback
                    )
                );
            } else {
                callback();
            }
        });
    };
}

/**
 * Handles a command execution request coming from the Context Broker. This handler should:
 *  - Identify the device affected by the command.
 *  - Send the command to the HTTP endpoint of the device.
 *  - Update the command status in the Context Broker while pending.
 *  - Update the command status when the result from the device is received.
 *
 * @param {Object} device           Device data stored in the IOTA.
 * @param {String} attributes       Command attributes (in NGSIv1 format).
 */
function commandHandler(device, attributes, callback) {
    utils.getEffectiveApiKey(device.service, device.subservice, device, function(error, apiKey) {
        async.series(attributes.map(generateCommandExecution.bind(null, apiKey, device)), function(error) {
            if (error) {
                // prettier-ignore
                config.getLogger().error(context, 
                    'COMMANDS-004: Error handling incoming command for device [%s]', device.id);

                utils.updateCommand(
                    apiKey,
                    device,
                    error.message,
                    error.command,
                    constants.COMMAND_STATUS_ERROR,
                    function(error) {
                        if (error) {
                            // prettier-ignore
                            config.getLogger().error(
                                context,
                                ' COMMANDS-005: Error updating error information for device [%s]',
                                device.id
                            );
                        }
                    }
                );
            } else {
                config.getLogger().debug('Incoming command for device [%s]', device.id);
            }
        });
    });

    callback();
}

function addDefaultHeader(req, res, next) {
    req.headers['content-type'] = req.headers['content-type'] || 'application/xml';
    next();
}

/**
 * Device provisioning handler. This handler just fills in the transport protocol in case there is none.
 *
 * @param {Object} device           Device object containing all the information about the provisioned device.
 */
function deviceProvisioningHandler(device, callback) {
    if (!device.transport) {
        device.transport = 'HTTP';
    }

    if (device.transport === 'HTTP') {
        if (device.endpoint) {
            device.polling = false;
        } else {
            device.polling = true;
        }
    }

    callback(null, device);
}

/////////////////////////////////////////////////////////////////////////
//
// Amended Function - uses an XML middleware to preprocess incoming measures
//
function start(callback) {
    const baseRoot = '/';

    httpBindingServer = {
        server: null,
        app: express(),
        router: express.Router()
    };

    config.getLogger().info(context, 'HTTP Binding listening on port [%s]', config.getConfig().http.port);

    httpBindingServer.app.set('port', config.getConfig().http.port);
    httpBindingServer.app.set('host', config.getConfig().http.host || '0.0.0.0');

    httpBindingServer.router.post(
        config.getConfig().iota.defaultResource || constants.HTTP_MEASURE_PATH,
        addDefaultHeader,
        xmlBodyParser({ trim: false, explicitArray: false }),
        checkMandatoryParams,
        parseData,
        addTimestamp,
        handleIncomingMeasure,
        returnCommands
    );

    httpBindingServer.app.use(baseRoot, httpBindingServer.router);
    httpBindingServer.app.use(handleError);

    httpBindingServer.server = http.createServer(httpBindingServer.app);

    httpBindingServer.server.listen(httpBindingServer.app.get('port'), httpBindingServer.app.get('host'), callback);
}
/////////////////////////////////////////////////////////////////////////

function stop(callback) {
    config.getLogger().info(context, 'Stopping XML HTTP Binding: ');

    if (httpBindingServer) {
        httpBindingServer.server.close(function() {
            config.getLogger().info('HTTP Binding Stopped');
            callback();
        });
    } else {
        callback();
    }
}

function sendPushNotifications(device, values, callback) {
    async.series(values.map(generateCommandExecution.bind(null, null, device)), function(error) {
        callback(error);
    });
}

function storePollNotifications(device, values, callback) {
    function addPollNotification(item, innerCallback) {
        iotAgentLib.addCommand(device.service, device.subservice, device.id, item, innerCallback);
    }

    async.map(values, addPollNotification, callback);
}

function notificationHandler(device, values, callback) {
    if (device.endpoint) {
        sendPushNotifications(device, values, callback);
    } else {
        storePollNotifications(device, values, callback);
    }
}

exports.start = start;
exports.stop = stop;
exports.deviceProvisioningHandler = deviceProvisioningHandler;
exports.notificationHandler = notificationHandler;
exports.commandHandler = commandHandler;
exports.protocol = 'HTTP';
