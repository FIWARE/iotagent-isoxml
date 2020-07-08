function addRef(refs, entity, attr) {
    if (entity[attr]) {
        refs.push(entity[attr]);
    }
}

/*

Mapping from Building DataModel to FRM

I CustomerIdRef = owner
*/
function frm(entity) {
    const refs = [];
    addRef(refs, entity, 'owner');
    return refs;
}

module.exports = {
    frm
};
