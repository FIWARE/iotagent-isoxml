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

let config = {};
let logger = require('logops');

function anyIsSet(variableSet) {
    for (let i = 0; i < variableSet.length; i++) {
        if (process.env[variableSet[i]]) {
            return true;
        }
    }

    return false;
}

function processEnvironmentVariables() {
    const environmentVariables = [
        'IOTA_MQTT_HOST',
        'IOTA_MQTT_PORT',
        'IOTA_MQTT_USERNAME',
        'IOTA_MQTT_PASSWORD',
        'IOTA_MQTT_QOS',
        'IOTA_MQTT_RETAIN',
        'IOTA_MQTT_RETRIES',
        'IOTA_MQTT_RETRY_TIME',
        'IOTA_MQTT_KEEPALIVE',
        'IOTA_AMQP_HOST',
        'IOTA_AMQP_PORT',
        'IOTA_AMQP_USERNAME',
        'IOTA_AMQP_PASSWORD',
        'IOTA_AMQP_EXCHANGE',
        'IOTA_AMQP_QUEUE',
        'IOTA_AMQP_DURABLE',
        'IOTA_AMQP_RETRIES',
        'IOTA_AMQP_RETRY_TIME',
        'IOTA_HTTP_HOST',
        'IOTA_HTTP_PORT',
        'IOTA_HTTP_TIMEOUT'
    ];
    const mqttVariables = [
        'IOTA_MQTT_HOST',
        'IOTA_MQTT_PORT',
        'IOTA_MQTT_USERNAME',
        'IOTA_MQTT_PASSWORD',
        'IOTA_MQTT_QOS',
        'IOTA_MQTT_RETAIN',
        'IOTA_MQTT_RETRIES',
        'IOTA_MQTT_RETRY_TIME',
        'IOTA_MQTT_KEEPALIVE'
    ];
    const amqpVariables = [
        'IOTA_AMQP_HOST',
        'IOTA_AMQP_PORT',
        'IOTA_AMQP_USERNAME',
        'IOTA_AMQP_PASSWORD',
        'IOTA_AMQP_EXCHANGE',
        'IOTA_AMQP_QUEUE',
        'IOTA_AMQP_DURABLE',
        'IOTA_AMQP_RETRIES',
        'IOTA_AMQP_RETRY_TIME'
    ];
    const httpVariables = ['IOTA_HTTP_HOST', 'IOTA_HTTP_PORT', 'IOTA_HTTP_TIMEOUT'];

    for (let i = 0; i < environmentVariables.length; i++) {
        if (process.env[environmentVariables[i]]) {
            logger.info(
                'Setting %s to environment value: %s',
                environmentVariables[i],
                process.env[environmentVariables[i]]
            );
        }
    }

    if (anyIsSet(mqttVariables)) {
        config.mqtt = {};
    }

    if (process.env.IOTA_MQTT_HOST) {
        config.mqtt.host = process.env.IOTA_MQTT_HOST;
    }

    if (process.env.IOTA_MQTT_PORT) {
        config.mqtt.port = process.env.IOTA_MQTT_PORT;
    }

    if (process.env.IOTA_MQTT_USERNAME) {
        config.mqtt.username = process.env.IOTA_MQTT_USERNAME;
    }

    if (process.env.IOTA_MQTT_PASSWORD) {
        config.mqtt.password = process.env.IOTA_MQTT_PASSWORD;
    }

    if (process.env.IOTA_MQTT_QOS) {
        config.mqtt.qos = process.env.IOTA_MQTT_QOS;
    }

    if (process.env.IOTA_MQTT_RETAIN) {
        config.mqtt.retain = process.env.IOTA_MQTT_RETAIN === 'true';
    }

    if (process.env.IOTA_MQTT_RETRIES) {
        config.mqtt.retries = process.env.IOTA_MQTT_RETRIES;
    }

    if (process.env.IOTA_MQTT_RETRY_TIME) {
        config.mqtt.retryTime = process.env.IOTA_MQTT_RETRY_TIME;
    }

    if (process.env.IOTA_MQTT_KEEPALIVE) {
        config.mqtt.keepalive = process.env.IOTA_MQTT_KEEPALIVE;
    }

    if (anyIsSet(amqpVariables)) {
        config.amqp = {};
    }

    if (process.env.IOTA_AMQP_HOST) {
        config.amqp.host = process.env.IOTA_AMQP_HOST;
    }

    if (process.env.IOTA_AMQP_PORT) {
        config.amqp.port = process.env.IOTA_AMQP_PORT;
    }

    if (process.env.IOTA_AMQP_USERNAME) {
        config.amqp.username = process.env.IOTA_AMQP_USERNAME;
    }

    if (process.env.IOTA_AMQP_PASSWORD) {
        config.amqp.password = process.env.IOTA_AMQP_PASSWORD;
    }

    if (process.env.IOTA_AMQP_EXCHANGE) {
        config.amqp.exchange = process.env.IOTA_AMQP_EXCHANGE;
    }

    if (process.env.IOTA_AMQP_QUEUE) {
        config.amqp.queue = process.env.IOTA_AMQP_QUEUE;
    }

    if (process.env.IOTA_AMQP_DURABLE) {
        config.amqp.options = {};
        config.amqp.options.durable = process.env.IOTA_AMQP_DURABLE === 'true';
    }

    if (process.env.IOTA_AMQP_RETRIES) {
        config.amqp.retries = process.env.IOTA_AMQP_RETRIES;
    }

    if (process.env.IOTA_AMQP_RETRY_TIME) {
        config.amqp.retryTime = process.env.IOTA_AMQP_RETRY_TIME;
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
