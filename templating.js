const nunjucks = require('nunjucks');

function createEnv(path, opts){
    let autoescape = opts.autoescape || true,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path, {
                noCache,
                watch
            }),{
                autoescape,
                throwOnUndefined
            }
        );
    if(opts.filters) {
        for(let f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

function templating(path='views', opts){
    // 创建nunjucks 的 env对象
    let env = createEnv(path, opts);
    return async (ctx, next)=>{
        //给ctx对象绑定render方法
        ctx.render = (view, model={})=>{
            ctx.response.body = env.render(view, Object.assign({}, ctx.state||{}, model));
            //设置content-type
            ctx.response.type = 'text/html';
        };
        await next();
    };
}

module.exports = templating;