/*
* Farm Management Information system
*/
const regex = /\d+$/g;
const allAttrs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const addressAttrs = [
    'streetAddress',
    'postOfficeBoxNumber',
    'postalCode',
    'addressLocality',
    'addressRegion',
    'addressCountry'
];
let idIndex = 0;

function resetIndex(){
    idIndex = 0;
}

function addAddressAttribute(attr, entity, to, from) {
    const toAttrs = allAttrs.slice(allAttrs.indexOf(to), allAttrs.indexOf(to) + 6);
    if (entity[from]) {
        toAttrs.forEach((toAttr, index) => {
            if (entity[from][addressAttrs[index]]) {
                attr[toAttr] = entity[from][addressAttrs[index]];
            }
        });
    }
}

function addId(attr, entity, type){
    let match = entity.id.match(regex);
    attr.A = type + '' + (match ? match[0] :   idIndex++);
}

function addAttribute(attr, entity, to, from) {
    if (entity[from]) {
        attr[to] = entity[from];
    }
}

function addRelationship(attr, entity, to, from, type) {
    if (entity[from]) {
        let match = entity[from].match(regex);
        attr[to] = type + match[0];
    }
}

module.exports = {
    addAddressAttribute,
    addAttribute,
    addRelationship,
    addId,
    resetIndex
};
