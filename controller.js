const fs = require('fs');
const router = require('koa-router')();

function addMapping(mapping){
    for(let url in mapping){
        if(url.startsWith('GET ')){
            router.get(url.substring(4), mapping[url]);
        }else if (url.startsWith('POST ')){
            router.post(url.substring(5), mapping[url])
        }else if (url.startsWith('DELETE ')){
            router.delete(url.substring(7), mapping[url]);
        }else if (url.startsWith('PUT ')){
            router.put(url.substring(4), mapping[url]);
        }
    }
}


//如果不传文件夹名称，则默认扫码controllers
function addControllers(dir='controllers'){
    fs.readdirSync(__dirname+'/'+dir)
        .filter(file=> file.endsWith('.js'))
        .map(file=> {
            addMapping(require(`${__dirname}/${dir}/${file}`));
        })
}

module.exports = (dir)=>{
    addControllers(dir);
    return router.routes();
};