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

const async = require('async');
const request = require('request');
const config = require('./configService');
const context = {
    op: 'IOTA.ISOXML.CBUtils'
};

/**
 * Generate a function that retrieves all entities to be used in the MICS payload.
 *
 * @param {String} apiKey           APIKey of the device's service or default APIKey.
 * @param {Object} device           Object containing all the information about a device.
 * @param {Object} attribute        Attribute in NGSI format.
 * @return {Function}               Command execution function ready to be called with async.series.
 */
function getContextEntities(apiKey, device, attribute, callback) {
    const cmdAttributes = attribute.value;
    const entities = {};

    function retrieveSingleEntity(item, callback) {
        const version = config.getConfig().contextBroker.ngsiVersion;
        const cbHost = config.getConfig().contextBroker.url;
        let path = '/v2/entities/';

        if (version === 'ld') {
            path = '/ngsi-ld/v1/entities/';
        }
        const options = {
            method: 'GET',
            url: cbHost + path + item,
            qs: { options: 'keyValues' },
            headers: {
                'fiware-service': device.service,
                'fiware-servicepath': device.subservice
            }
        };

        request(options, function(error, response) {
            if (error) {
                return callback(error);
            }
            const result = {
                id: item,
                entity: response.body
            };
            return callback(null, result);
        });
    }

    function retrieveEntities(ids, entities, callback) {
        async.map(ids, retrieveSingleEntity, function(err, results) {
            if (err) {
                return callback(err);
            }
            const refIds = [];
            results.forEach(function(result) {
                entities[result.id] = result.entity;
                if (result.refids) {
                    result.refids.forEach(function(refid) {
                        if (!entities[refid]) {
                            refIds.push(refid);
                        }
                    });
                }
            });
            return refIds.length === 0 ? callback() : retrieveEntities(refIds, entities, callback);
        });
    }

    // Start by checking the entity which has pushed the command.
    const entityIds = [device.name];
    // Add any additional entities found within the command
    if (cmdAttributes && cmdAttributes.entities) {
        cmdAttributes.entities.forEach((id) => {
            entityIds.push(id);
        });
    }
    // Get each entity and recursively check for any references.
    retrieveEntities(entityIds, entities, function(err) {
        if (err) {
            config.getLogger().error(context, 'Error [%s] retrieving entities: %s', err.name, err.message);
        }
        callback(null, entities);
    });
}

exports.getContextEntities = getContextEntities;
