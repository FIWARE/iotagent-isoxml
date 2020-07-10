const fs = require('fs');
const xml = require('xml');


function readJSON(name, raw) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return  JSON.parse(text);
}

function readXML(name, raw) {
    let text = null;
    try {
        text = fs.readFileSync(name, 'UTF8');
    } catch (e) {
        /* eslint-disable no-console */
        console.error(JSON.stringify(e));
    }
    return text;
}

function convertToXML (xmlObject){
	return xml(xmlObject, {});
}


exports.readJSON = readJSON;
exports.readXML = readXML;
exports.convertToXML = convertToXML;