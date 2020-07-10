/*
* Farm Management Information system
*/
const FMIS = require('./transforms').FMIS;

const Farm = require('../../conf/farm');
const Worker = require('../../conf/worker');
const Customer = require('../../conf/customer');

module.exports = {
    ctr: Customer.transformFMIS,
    frm: Farm.transformFMIS,
    wkr: Worker.transformFMIS,
    resetIndex: FMIS.resetIndex
};
