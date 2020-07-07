const attrs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function update(entity, typeInformation, callback) {
    attrs.forEach((attr) => {
        delete entity[attr];
    });
    return callback(null, entity, typeInformation);
}

exports.update = update;
