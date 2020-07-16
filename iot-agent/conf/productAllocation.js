const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'PAN';
const ngsiType = 'ProductAllocation';

/*
A ProductIdRef
B QuantityDDI
C QuantityValue
D TransferMode
 1 = Filling
 2 = Emptying
 3 = Remainder
E DeviceElementIdRef
F ValuePresentationIdRef

ASP AllocationStamp
*/

const TRANSFER_MODES = {
    '1': 'Filling',
    '2': 'Emptying',
    '3': 'Remainder'
};

/**
 * This function maps an NGSI object to an ISOXML PAN
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addRelationship(attr, entity, 'A', 'productIdRef', 'Product');
    FMIS.addAttribute(attr, entity, 'B', 'quantityDDI');
    FMIS.addAttribute(attr, entity, 'C', 'quantityValue');
    FMIS.addAddressAttribute(attr, entity, 'D', 'transferMode');
    FMIS.addRelationship(attr, entity, 'E', 'deviceElementIdRef', 'DeviceElement');
    FMIS.addRelationship(attr, entity, 'F', 'valuePresentationIdRef', 'ValuePresentation');
    return xml;
}

/**
 * This function maps an ISOXML PAN to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addRelationship(entity, 'A', 'productIdRef', 'Product', normalized);
    MICS.addProperty(entity, 'B', 'quantityDDI', schema.TEXT, normalized);
    MICS.addInt(entity, 'C', 'quantityValue', schema.NUMBER, normalized);
    MICS.addMappedProperty(entity, 'D', 'transferMode', schema.TEXT, TRANSFER_MODES, normalized);
    MICS.addRelationship(entity, 'E', 'deviceElementIdRef', 'DeviceElement', normalized);
    MICS.addRelationship(entity, 'F', 'valuePresentationIdRef', 'ValuePresentation', normalized);
    MICS.addTimestamp(entity, 'ASP', normalized);
    return entity;
}

function relationships(entity) {
    const refs = [];
    transforms.addReference(refs, entity, 'productIdRef');
    transforms.addReference(refs, entity, 'deviceElementIdRef');
    transforms.addReference(refs, entity, 'valuePresentationIdRef');
    return refs;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    relationships,
    ngsiType
};
