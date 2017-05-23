const Sequelize = require('sequelize');
const uuid = require('node-uuid');
const config = require('./config.js');

const ID_TYPE = Sequelize.STRING(50);

function generateId() {
    return uuid.v4();
}

let sequelize = new Sequelize(config.database, config.username, config.password,{
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

function defineModel(name, attributes) {
    let attrs = {};
    for(let key in attributes){
        let value = attributes[key];
        if(typeof value=='object' && value['type']){
            attrs[key] = Object.assign({},value, {allowNull:value.allowNull || false});
        }else {
            attrs[key] = {type: value, allowNull: false};
        }
    }
    let commonAttrs = {
        id: {
            type: ID_TYPE,
            primaryKey: true
        },
        createInstance: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        modifyInstance: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        version: {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    };

    return sequelize.define(name, Object.assign({}, attrs, commonAttrs), {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate(obj){
                let now = Date.now();
                if(obj.isNewRecord){
                    if(!obj.id){
                        obj.id = generateId();
                    }
                    obj.createInstance = now;
                    obj.modifyInstance = now;
                    obj.version = 0;
                }else {
                    obj.modifyInstance = now;
                    obj.version++;
                }
            }
        }
    })
}

const types = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

let db = {
    ID: ID_TYPE,
    generateId,
    defineModel,
    sync(){
        if(process.env.NODE_ENV !== 'production'){
            return sequelize.sync({force: true});
        }else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

types.map(type=> db[type]=Sequelize[type]);

module.exports = db;