const micsAdapter = require('../../conf/micsAdapter');
const config = require('../configService');

function update(entity, typeInformation, callback) {
    const statics = typeInformation.staticAttributes;
    if (statics && Array.isArray(statics) && statics.length > 0) {
        statics.forEach((attr) => {
            if (attr.name === config.getConfig().isoxmlType) {
                const transform = micsAdapter[attr.value];
                if (typeof transform === 'function') {
                    entity = transform(entity, typeInformation);
                }
            }
        });
    }
    return callback(null, entity, typeInformation);
}

exports.update = update;
