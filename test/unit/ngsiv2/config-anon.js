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

const config = {};

config.http = {
    port: 7896
};

config.iota = {
    logLevel: 'ERROR',
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
    types: {
        AttachedFile: { apikey: 'afe' },
        BaseStation: { apikey: 'bsn' },
        CodedComment: { apikey: 'cct' },
        CodedCommentGroup: { apikey: 'ccg' },
        ColourLegend: { apikey: 'cld' },
        CropType: { apikey: 'ctp' },
        CulturalPractice: { apikey: 'cpc' },
        Customer: {
            apikey: 'ctr',
            static_attributes: [
                {
                    name: 'hasOccupation',
                    type: 'Occupation',
                    value: {
                        name: 'Customer'
                    }
                }
            ]
        },
        Device: { apikey: 'dvc' },
        Farm: {
            apikey: 'frm',
            static_attributes: [
                {
                    name: 'category',
                    type: 'Text',
                    value: 'farm'
                }
            ]
        },
        OperationTechique: { apikey: 'otq' },
        PartField: { apikey: 'pfd' },
        Product: { apikey: 'pdt' },
        ProductGroup: { apikey: 'pgp' },
        TaskControllerCapabilities: { apikey: 'tcc' },
        Task: { apikey: 'tsk' },
        ValuePresentation: { apikey: 'vpn' },
        Worker: {
            apikey: 'wkr',
            static_attributes: [
                {
                    name: 'hasOccupation',
                    type: 'Occupation',
                    value: {
                        name: 'Worker'
                    }
                }
            ]
        },
        ExternalFileReference: { apikey: 'xfr' }
    },
    service: 'isoxml',
    subservice: '/',
    providerUrl: 'http://localhost:4061',
    deviceRegistrationDuration: 'P1M',
    defaultType: 'Thing',
    defaultResource: '/iot/isoxml',
    isoxmlType: 'isoxml_type'
};

config.defaultTransport = 'HTTP';
config.contextBroker = {
    url: 'http://192.168.1.1:1026'
};
config.mics_endpoint = 'http://mics/iot/isoxml';

module.exports = config;
