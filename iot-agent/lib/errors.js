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

class ParseError {
    constructor(errorMsg) {
        this.name = 'PARSE_ERROR';
        this.message = 'There was a syntax error in the ISOXML request: ' + errorMsg;
        this.code = 400;
    }
}
class UnsupportedType {
    constructor(expectedType) {
        this.name = 'UNSUPPORTED_TYPE';
        // prettier-ignore
        this.message = 'The request content didn\'t have the expected type [' + expectedType + ' ]';
        this.code = 400;
    }
}
class ConfigurationError {
    constructor(errorMsg) {
        this.name = 'CONFIGURATION_ERROR';
        this.message = 'There was an error in the configuration file, starting the agent: ' + errorMsg;
        this.code = 501;
    }
}
class GroupNotFound {
    constructor(service, subservice) {
        this.name = 'GROUP_NOT_FOUND';
        this.message = 'Group not found for service [' + service + '] and subservice [' + subservice + ']';
        this.code = 404;
    }
}
class DeviceNotFound {
    constructor(deviceId) {
        this.name = 'DEVICE_NOT_FOUND';
        this.message = 'Device not found with ID [' + deviceId + ']';
        this.code = 404;
    }
}
class MandatoryParamsNotFound {
    constructor(paramList) {
        this.name = 'MANDATORY_PARAMS_NOT_FOUND';
        /*jshint quotmark: double */
        this.message = "Some of the mandatory params weren't found in the request: " + JSON.stringify(paramList);
        /*jshint quotmark: single */
        this.code = 400;
    }
}
class HTTPCommandResponseError {
    constructor(code, error, command) {
        this.command = command;
        this.name = 'HTTP_COMMAND_RESPONSE_ERROR';
        this.message = 'There was an error in the response of a device to a command [' + code + ']:' + error;
        this.code = 400;
    }
}

module.exports = {
    ParseError,
    UnsupportedType,
    ConfigurationError,
    GroupNotFound,
    DeviceNotFound,
    MandatoryParamsNotFound,
    HTTPCommandResponseError
};
