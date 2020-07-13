/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of iotagent-mqtt
 *
 * iotagent-mqtt is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-mqtt is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-mqtt.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[contacto@tid.es]
 */
const config = {};

config.http = {
    port: 7896
};

config.iota = {
    logLevel: 'FATAL',
    contextBroker: {
        host: '192.168.1.1',
        port: '1026',
        ngsiVersion: 'v2',
        url: 'http://192.168.1.1:1026'
    },
    server: {
        port: 4061
    },
    deviceRegistry: {
        type: 'memory'
    },
    types: {},
    service: 'howtoService',
    subservice: '/howto',
    providerUrl: 'http://localhost:4061',
    deviceRegistrationDuration: 'P1M',
    defaultType: 'Thing',
    defaultResource: '/iot/isoxml',
    isoxmlType: 'isoxml_type',
    
};

config.defaultTransport = 'HTTP';
config.contextBroker = {
    url: 'http://192.168.1.1:1026'
};
config.mics_endpoint = 'http://mics/iot/isoxml';

module.exports = config;
