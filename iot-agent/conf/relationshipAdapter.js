function addRef(refs, entity, attr) {
    if (entity[attr]) {
        refs.push(entity[attr]);
    }
}

/*
	Building.owner = FRM.I  - CustomerIdRef 
*/
function frm(entity) {
    const refs = [];
    addRef(refs, entity, 'owner');
    return refs;
}

module.exports = {
    frm
};
