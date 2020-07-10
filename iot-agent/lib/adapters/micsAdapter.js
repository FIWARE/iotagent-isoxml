const MICS = require('./transforms').MICS;

const Farm = require('../../conf/farm');
const Worker = require('../../conf/worker');
const Customer = require('../../conf/customer');

module.exports = {
    ctr: Customer.transformMICS,
    frm: Farm.transformMICS,
    wkr: Worker.transformMICS
};
