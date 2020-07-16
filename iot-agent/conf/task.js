const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const smartDataModels = require('../lib/adapters/smartDataModels');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const connection = require('./connection');
const controlAssignment = require('./controlAssignment');
const commentAllocation = require('./commentAllocation');
const customer = require('./customer');
const dataLogTrigger = require('./dataLogTrigger');
const deviceAllocation = require('./deviceAllocation');
const farm = require('./worker');
const grid = require('./grid');
const guidanceAllocation = require('./guidanceAllocation');
const operTechPractice = require('./operTechPractice');
const productAllocation = require('./productAllocation');
const time = require('./time');
const treatmentZone = require('./treatmentZone');
const worker = require('./farm');
const workerAllocation = require('./workerAllocation');
const timeLog = require('./timeLog');

const isoxmlType = 'TSK';
const ngsiType = 'Activity';

/*
A TaskId
B TaskDesignator - name
C CustomerIdRef - owner
D FarmIdRef - refTarget
E PartfieldIdRef - refObject
F ResponsibleWorkerIdRef -refAgent
G TaskStatus - status
H DefaultTreatmentZoneCode - defaultTreatment
I PositionLostTreatmentZoneCode - positionLost
J OutOfFieldTreatmentZoneCode - outOfFieldTreatement


TZN TreatmentZone 
TIM Time 
OTP OperTechPractice 
WAN WorkerAllocation 
DAN DeviceAllocation 
CNN Connection 
PAN ProductAllocation 
DLT DataLogTrigger 
CAN CommentAllocation 
TLG TimeLog
GRD Grid
CAT ControlAssignment
GAN GuidanceAllocation

*/

const ACTIVITY_TYPES = {
    '1': 'planned',
    '2': 'running',
    '3': 'paused',
    '4': 'completed',
    '5': 'template',
    '6': 'canceled'
};

/**
 * This function maps a smart-data-models Activity to ISOXML TSK
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'name');
    FMIS.addRelationship(attr, entity, 'C', 'owner', customer.isoxmlType);
    FMIS.addRelationship(attr, entity, 'D', 'refTarget', farm.isoxmlType);
    FMIS.addRelationship(attr, entity, 'E', 'refObject', 'PFD');
    FMIS.addRelationship(attr, entity, 'F', 'refAgent', worker.isoxmlType);
    FMIS.addAttribute(attr, entity, 'G', 'status');
    FMIS.addAttribute(attr, entity, 'H', 'defaultTreatment');
    FMIS.addAttribute(attr, entity, 'I', 'positionLost');
    FMIS.addAttribute(attr, entity, 'J', 'outOfFieldTreatment');

    return xml;
}

/**
 * This function maps an ISOXML TSK to a smart-data-models Building
 */
function transformMICS(entity, normalized) {
    if (entity.A && !normalized) {
        entity.id = transforms.generateURI(entity.A, isoxmlType);
    }
    MICS.addProperty(entity, 'B', 'name', schema.TEXT, normalized);
    MICS.addRelationship(entity, 'C', 'owner', schema.PERSON, normalized);
    MICS.addRelationship(entity, 'D', 'refTarget', smartDataModels.BUILDING, normalized);
    MICS.addRelationship(entity, 'E', 'refObject', smartDataModels.PART_FIELD, normalized);
    MICS.addRelationship(entity, 'F', 'refAgent', schema.PERSON, normalized);
    MICS.addMappedProperty(entity, 'G', 'activityType', schema.TEXT, ACTIVITY_TYPES, normalized);
    MICS.addProperty(entity, 'H', 'defaultTreatment', schema.TEXT, normalized);
    MICS.addProperty(entity, 'I', 'positionLost', schema.TEXT, normalized);
    MICS.addProperty(entity, 'J', 'outOfFieldTreatment', schema.TEXT, normalized);

    MICS.addArray(entity, commentAllocation, 'commentAllocation', normalized);
    MICS.addArray(entity, connection, 'connection', normalized);
    MICS.addArray(entity, controlAssignment, 'controlAssignment', normalized);
    MICS.addArray(entity, dataLogTrigger, 'dataLogTrigger', normalized);
    MICS.addArray(entity, deviceAllocation, 'deviceAllocation', normalized);
    MICS.addArray(entity, guidanceAllocation, 'guidanceAllocation', normalized);
    MICS.addObject(entity, grid, 'grid', normalized);
    MICS.addObject(entity, operTechPractice, 'operTechPractice', normalized);
    MICS.addArray(entity, productAllocation, 'productAllocation', normalized);
    MICS.addArray(entity, treatmentZone, 'treatmentZone', normalized);
    MICS.addArray(entity, time, 'time', normalized);
    MICS.addArray(entity, timeLog, 'timeLog', normalized);
    MICS.addArray(entity, workerAllocation, 'workerAllocation', normalized);

    return entity;
}

/*
 *  This function lists the reference relationships of an ISOXML TSK
 *
 *  C CustomerIdRef - owner
 *  D FarmIdRef - refTarget
 *  E PartfieldIdRef - refObject
 *  F ResponsibleWorkerIdRef -refAgent
 */
function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'owner');
    transforms.addReference(refs, entity, 'refTarget');
    transforms.addReference(refs, entity, 'refObject');
    transforms.addReference(refs, entity, 'refAgent');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    relationships,
    isoxmlType,
    ngsiType
};
