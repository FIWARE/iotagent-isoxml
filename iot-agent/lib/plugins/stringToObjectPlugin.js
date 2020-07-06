function update(entity, typeInformation, callback) {
    Object.keys(entity).forEach((key) => {
        const value = entity[key].value;
        if (typeof value === 'string' || value instanceof String) {
            try {
                if (value.startsWith('{') && value.endsWith('}')) {
                    entity[key].value = JSON.parse(value);
                }
            } catch (e) {
                console.log(e);
            }
        }
    });

    console.log(entity);
    return callback(null, entity, typeInformation);
}

exports.update = update;
