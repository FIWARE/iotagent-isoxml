function update(entity, typeInformation, callback) {
    const internals = typeInformation.internalAttributes;
    if (internals && Array.isArray(internals) && internals.length > 0) {
        const deleteAttrs = internals[0].delete;
        if (deleteAttrs) {
            deleteAttrs.forEach((attr) => {
                delete entity[attr];
            });
        }
    }
    return callback(null, entity, typeInformation);
}

exports.update = update;
