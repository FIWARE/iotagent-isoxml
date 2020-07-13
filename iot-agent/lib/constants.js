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

module.exports = {
    MEASURES_SUFIX: 'attrs',
    CONFIGURATION_SUFIX: 'configuration',
    CONFIGURATION_COMMAND_SUFIX: 'commands',
    CONFIGURATION_COMMAND_UPDATE: 'cmdexe',
    CONFIGURATION_VALUES_SUFIX: 'values',

    /*jshint quotmark: double */
    DATE_FORMAT: "yyyymmdd'T'HHMMss'Z'",
    /*jshint quotmark: single */

    TIMESTAMP_ATTRIBUTE: 'TimeInstant',
    TIMESTAMP_TYPE: 'ISO8601',
    TIMESTAMP_TYPE_NGSI2: 'DateTime',

    HTTP_MEASURE_PATH: '/iot/isoxml',

    DEFAULT_ATTRIBUTE_TYPE: 'string',
    DEFAULT_ISOXML_TYPE: 'isoxml_type',
    DEFAULT_URI_PREFIX: 'urn:ngsi-ld:',

    COMMAND_STATUS_PENDING: 'PENDING',
    COMMAND_STATUS_ERROR: 'ERROR',
    COMMAND_STATUS_COMPLETED: 'OK'
};
