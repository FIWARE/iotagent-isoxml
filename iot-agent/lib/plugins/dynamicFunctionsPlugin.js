const micsAdapter = require('../../conf/micsAdapter');

function update(entity, typeInformation, callback) {
    const internals = typeInformation.internalAttributes;
    if (internals && Array.isArray(internals) && internals.length > 0) {
        const isoxmlElement = internals[0].isoxml_element;
        entity = micsAdapter[isoxmlElement](entity, typeInformation);
    }
    return callback(null, entity, typeInformation);
}

exports.update = update;
