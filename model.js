const fs = require('fs');
const db = require('./db.js');

let files = fs.readdirSync(__dirname+'/models')
                .filter(file=> file.endsWith('.js'))
                .map(file=> {
                    let name = file.substring(0, file.length-3);
                    module.exports = {
                        [`${name}`]: require(__dirname+'/models/'+file)
                    };
                });


module.exports.sync = ()=> db.sync();

