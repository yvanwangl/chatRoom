let configDefault = './configDefault.js';
let configTest = './configTest.js';
let configOverride = './configOverride.js';
const fs = require('fs');

let config = require(configDefault);

//如果是测试环境，加载测试配置
if(process.env.NODE_ENV==='test'){
    config = Object.assign(config, require(configTest));
}else {
    try{
        if(fs.statSync(configOverride).isFile()){
            config = Object.assign(config, require(configOverride));
        }
    }catch(err){
        throw new Error(`Can not load ${configOverride}`)
    }
}

module.exports = config;
