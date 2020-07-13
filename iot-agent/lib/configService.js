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

let config = {};
let logger = require('logops');
const fs = require('fs');
const constants = require('./constants');

function anyIsSet(variableSet) {
    for (let i = 0; i < variableSet.length; i++) {
        if (process.env[variableSet[i]]) {
            return true;
        }
    }

    return false;
}

/**
 * For a parameter pointing to a file, check the file exists
 *
 * @param {string} path        Path to the file
 */
function fileExists(path) {
    try {
        fs.statSync(path);
        logger.debug(path + ' - File exists.');
    } catch (e) {
        logger.fatal(path + ' - File does not exist.');
        throw Error(path + ' - File does not exist.');
    }
}

function processEnvironmentVariables() {
    const environmentVariables = [
        'IOTA_HTTP_HOST',
        'IOTA_HTTP_PORT',
        'IOTA_HTTP_TIMEOUT',
        'IOTA_HTTP_KEY',
        'IOTA_HTTP_CERT',
        'IOTA_HTTP_DEFAULT_MICS_ENDPOINT'
    ];

    const httpVariables = [
        'IOTA_HTTP_HOST',
        'IOTA_HTTP_PORT',
        'IOTA_HTTP_TIMEOUT',
        'IOTA_HTTP_KEY',
        'IOTA_HTTP_CERT',
        'IOTA_HTTP_DEFAULT_MICS_ENDPOINT'
    ];

    for (let i = 0; i < environmentVariables.length; i++) {
        let value = process.env[environmentVariables[i]];
        if (value) {
            if (environmentVariables[i].endsWith('USERNAME') || environmentVariables[i].endsWith('PASSWORD')) {
                value = '********';
            }
            logger.info('Setting %s to environment value: %s', environmentVariables[i], value);
        }
    }

    if (anyIsSet(httpVariables)) {
        config.http = {};
    }

    if (process.env.IOTA_HTTP_HOST) {
        config.http.host = process.env.IOTA_HTTP_HOST;
    }

    if (process.env.IOTA_HTTP_PORT) {
        config.http.port = process.env.IOTA_HTTP_PORT;
    }

    if (process.env.IOTA_HTTP_TIMEOUT) {
        config.http.timeout = process.env.IOTA_HTTP_TIMEOUT;
    }

    if (process.env.IOTA_HTTP_KEY) {
        fileExists(process.env.IOTA_HTTP_KEY);
        config.http.key = process.env.IOTA_HTTP_KEY;
    }

    if (process.env.IOTA_HTTP_CERT) {
        fileExists(process.env.IOTA_HTTP_CERT);
        config.http.cert = process.env.IOTA_HTTP_CERT;
    }

    if (process.env.IOTA_DEFAULT_MICS_ENDPOINT) {
        config.mics_endpoint = process.env.IOTA_DEFAULT_MICS_ENDPOINT;
    }

    if (process.env.IOTA_DEFAULT_ISOXML_TYPE) {
        config.isoxmlType = process.env.IOTA_DEFAULT_ISOXML_TYPE;
    }
    if (!config.isoxmlType) {
        config.isoxmlType = constants.DEFAULT_ISOXML_TYPE;
    }
}

function setConfig(newConfig) {
    config = newConfig;

    processEnvironmentVariables();
}

function getConfig() {
    return config;
}

function setLogger(newLogger) {
    logger = newLogger;
}

function getLogger() {
    return logger;
}

exports.setConfig = setConfig;
exports.getConfig = getConfig;
exports.setLogger = setLogger;
exports.getLogger = getLogger;
