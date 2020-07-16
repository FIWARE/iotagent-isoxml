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

const transforms = require('./transforms');

const connection = require('../../conf/connection');
const controlAssignment = require('../../conf/controlAssignment');
const commentAllocation = require('../../conf/commentAllocation');
const customer = require('../../conf/customer');
const dataLogTrigger = require('../../conf/dataLogTrigger');
const deviceAllocation = require('../../conf/deviceAllocation');
const farm = require('../../conf/farm');
const grid = require('../../conf/grid');
const guidanceAllocation = require('../../conf/guidanceAllocation');
const operTechPractice = require('../../conf/operTechPractice');
const productAllocation = require('../../conf/productAllocation');
const task = require('../../conf/task');
const time = require('../../conf/time');
const timeLog = require('../../conf/timeLog');
const treatmentZone = require('../../conf/treatmentZone');
const worker = require('../../conf/worker');
const workerAllocation = require('../../conf/workerAllocation');

/*
* Farm Management Information system
*/
const FMIS = {
    cnn: connection.transformFMIS,
    can: commentAllocation.transformFMIS,
    cat: controlAssignment.transformFMIS,
    ctr: customer.transformFMIS,
    dlt: dataLogTrigger.transformFMIS,
    dan: deviceAllocation.transformFMIS,
    frm: farm.transformFMIS,
    grd: grid.transformFMIS,
    gan: guidanceAllocation.transformFMIS,
    otp: operTechPractice.transformFMIS,
    pan: productAllocation.transformFMIS,
    tim: time.transformFMIS,
    tlg: timeLog.transformFMIS,
    tsk: task.transformFMIS,
    tzn: treatmentZone.transformFMIS,
    wkr: worker.transformFMIS,
    wan: workerAllocation.transformFMIS,
    resetIndex: transforms.FMIS.resetIndex
};

/*
* Mobile Information Control system
*/
const MICS = {
    cnn: connection.transformMICS,
    cat: controlAssignment.transformMICS,
    can: commentAllocation.transformMICS,
    ctr: customer.transformMICS,
    dan: deviceAllocation.transformMICS,
    dlt: dataLogTrigger.transformMICS,
    frm: farm.transformMICS,
    grd: grid.transformMICS,
    gan: guidanceAllocation.transformMICS,
    otp: operTechPractice.transformMICS,
    pan: productAllocation.transformMICS,
    tim: time.transformMICS,
    tlg: timeLog.transformMICS,
    tsk: task.transformMICS,
    tzn: treatmentZone.transformMICS,
    wkr: worker.transformMICS,
    wan: workerAllocation.transformMICS
};

const Relationships = {
    can: commentAllocation.relationships,
    dan: deviceAllocation.relationships,
    dlt: dataLogTrigger.relationships,
    frm: farm.relationships,
    otp: operTechPractice.relationships,
    tsk: task.relationships,
    wan: workerAllocation.relationships
};

module.exports = {
    FMIS,
    MICS,
    Relationships
};
