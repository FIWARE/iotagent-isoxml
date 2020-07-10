/*
* Farm Management Information system
*/
const transforms = require('./transforms');

const Farm = require('../../conf/farm');
const Worker = require('../../conf/worker');
const Customer = require('../../conf/customer');

const FMIS = {
    ctr: Customer.transformFMIS,
    frm: Farm.transformFMIS,
    wkr: Worker.transformFMIS,
    resetIndex: transforms.FMIS.resetIndex
};

const MICS = {
    ctr: Customer.transformMICS,
    frm: Farm.transformMICS,
    wkr: Worker.transformMICS
};

const Relationships = {
    frm: Farm.relationships
};

module.exports = {
    FMIS,
    MICS,
    Relationships
};
