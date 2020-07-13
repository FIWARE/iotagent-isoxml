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

const async = require('async');
const request = require('request');
const config = require('./configService');
const context = {
    op: 'IOTA.ISOXML.CBUtils'
};
const relationshipAdapter = require('./adapters/adapter').Relationships;

function checkNgsiLD() {
    if (
        config.getConfig().contextBroker &&
        config.getConfig().contextBroker.ngsiVersion &&
        config.getConfig().contextBroker.ngsiVersion === 'ld'
    ) {
        return true;
    }

    return false;
}

/**
 * Generate a function that retrieves all the Context Broker entities to be used in the MICS payload.
 *
 * @param {String} apiKey           APIKey of the device's service or default APIKey.
 * @param {Object} device           Object containing all the information about a device.
 * @param {Object} attribute        Attribute in NGSI format.
 * @return {Function}               Command execution function ready to be called with async.series.
 */
function getContextEntities(apiKey, device, attribute, callback) {
    const cmdAttributes = attribute.value;
    const entities = {};

    /**
     * Make a request to the context broker and database in turn to find
     * the complete list of entities to send as a "command".
     */
    function retrieveSingleEntity(item, callback) {
        const cbHost = config.getConfig().contextBroker.url;
        let path = '/v2/entities/';

        if (checkNgsiLD()) {
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
            const entity = JSON.parse(response.body);
            const result = {
                id: item,
                entity
            };

            if (entity[config.getConfig().isoxmlType]) {
                const getRelationships = relationshipAdapter[entity[config.getConfig().isoxmlType]];
                if (typeof getRelationships === 'function') {
                    result.refids = getRelationships(entity);
                }
            }
            return callback(null, result);
        });
    }

    /**
     * Recursively iterate through all required entities and their dependencies.
     */
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

    // Start by loading the entity which has pushed the command.
    const entityIds = [device.name];
    // Add any additional entities found within the command payload
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
