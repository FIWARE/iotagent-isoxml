const fs = require('fs');
const xml = require('xml');

const isoxmlPrefix =
    '<ISO11783_TaskData TaskControllerVersion="" VersionMinor="1" ManagementSoftwareManufacturer="Topcon Precision Agriculture" DataTransferOrigin="2" ManagementSoftwareVersion="1.0" TaskControllerManufacturer="" VersionMajor="4" >';

const isoxmlPostfix = '</ISO11783_TaskData>';

function readJSON(name) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return JSON.parse(text);
}

function readXML(name) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return text;
}

function readISOXML(name) {
    const xml = readXML(name); 
    return isoxmlPrefix + xml + isoxmlPostfix;
}

function convertToXML(xmlObject) {
    return xml(xmlObject, {});
}

exports.readJSON = readJSON;
exports.readXML = readXML;
exports.convertToXML = convertToXML;
exports.readISOXML = readISOXML;
