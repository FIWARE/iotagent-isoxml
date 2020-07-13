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

const http = require('http');
const async = require('async');
const apply = async.apply;
const iotAgentLib = require('iotagent-node-lib');
const _ = require('underscore');
const intoTrans = iotAgentLib.intoTrans;
const express = require('express');
const utils = require('../iotaUtils');
const contextBroker = require('../contextBrokerUtils');
const xmlBodyParser = require('express-xml-bodyparser');
const constants = require('../constants');
const errors = require('../errors');
const isoxmlParser = require('../isoxmlParser');
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
    const payload = req.body.iso11783_taskdata;

    config.getLogger().debug(context, 'Parsing payload [%s]', JSON.stringify(payload));

    try {
        Object.keys(payload).forEach((key) => {
            if (key === '$') {
                return;
            }
            const obj = {};
            obj[key] = isoxmlParser.parse(payload[key]);
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

function checkMandatoryParams(req, res, next) {
    const notFoundParams = [];
    let error;
    const payload = req.isoxmlData;

    if (payload) {
        Object.keys(payload).forEach((key) => {
            const type = Object.keys(payload[key])[0];
            const entity = payload[key][type];
                if (Array.isArray(entity)) {
                    entity.forEach((element) => {
                        if (!element.A) {
                            notFoundParams.push('Id for Entity: ' + key);
                        }
                    });
                } else if (!entity.A) {
                    notFoundParams.push('Id for Entity: ' + key);
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

/**
 * This middleware checks whether there is any polling command pending to be sent to the device. If there is some,
 * add the command information to the return payload. Otherwise it returns an empty payload.
 */

/* eslint-disable-next-line no-unused-vars */
function returnCommands(req, res, next) {
     res.status(200).send('');
}

function handleIncomingMeasure(req, res, next) {
    res.locals.errors = [];
    // prettier-ignore
    config.getLogger().debug('Processing ISOXML data');

    function processHTTPWithDevice(device, data, apiKey, callback) {
        const attributes = [];
        Object.keys(data).forEach((key) => {
            if (key !== 'A') {
                attributes.push({ name: key, value: data[key], type: 'String' });
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

    async.map(measures, processDeviceMeasure, () => {
        if (res.locals.errors.length === 0) {
            return next();
        }
        if (res.locals.errors.length === 1 && measures.length === 1) {
            return next(res.locals.errors[0]);
        } else if (res.locals.errors.length === measures.length) {
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
function generateCommandExecution(apiKey, device, attribute, entities, callback) {
    const cmdName = attribute.name;
    const cmdAttributes = attribute.value;

    const options = {
        url: device.endpoint || config.getConfig().mics_endpoint,
        method: 'POST',
        body: isoxmlParser.createCommandPayload(device, cmdName, cmdAttributes, entities),
        headers: {
            'fiware-service': device.service,
            'fiware-servicepath': device.subservice
        }
    };

    if (config.getConfig().http.timeout) {
        options.timeout = config.getConfig().http.timeout;
    }

    let commandObj;

    request(options, function(error, response, body) {
        if (error) {
            callback(new errors.HTTPCommandResponseError('', error, cmdName));
        } else if (response.statusCode !== 200) {
            let errorMsg;

            try {
                commandObj = isoxmlParser.result(body);
                errorMsg = commandObj.result;
            } catch (e) {
                errorMsg = body;
            }

            callback(new errors.HTTPCommandResponseError(response.statusCode, errorMsg, cmdName));
        } else if (apiKey) {
            process.nextTick(
                utils.updateCommand.bind(
                    null,
                    apiKey,
                    device,
                    '',
                    cmdName,
                    constants.COMMAND_STATUS_COMPLETED,
                    callback
                )
            );
        } else {
            callback();
        }
    });
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
        contextBroker.getContextEntities(apiKey, device, attributes[0], function(error, entities) {
            generateCommandExecution(apiKey, device, attributes[0], entities, function(error) {
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
    });

    callback();
}

function addDefaultHeader(req, res, next) {
    req.headers['content-type'] = req.headers['content-type'] || 'application/xml';
    next();
}

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
        parseData,
        checkMandatoryParams,
        handleIncomingMeasure,
        returnCommands
    );

    httpBindingServer.app.use(baseRoot, httpBindingServer.router);
    httpBindingServer.app.use(handleError);

    httpBindingServer.server = http.createServer(httpBindingServer.app);
    httpBindingServer.server.listen(httpBindingServer.app.get('port'), httpBindingServer.app.get('host'), callback);
}

function stop(callback) {
    config.getLogger().info(context, 'Stopping ISOXML HTTP Binding: ');

    if (httpBindingServer) {
        httpBindingServer.server.close(function() {
            config.getLogger().info('HTTP Binding Stopped');
            callback();
        });
    } else {
        callback();
    }
}

exports.start = start;
exports.stop = stop;
exports.commandHandler = commandHandler;
exports.protocol = 'HTTP';
