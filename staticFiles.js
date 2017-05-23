const path = require('path');
// 我们使用了一个mz的包，并通过require('mz/fs');导入。
//mz提供的API和Node.js的fs模块完全相同，
//但fs模块使用回调，而mz封装了fs对应的函数，并改为Promise。
//这样，我们就可以非常简单的用await调用mz的函数，而不需要任何回调。
const fs = require('mz/fs');
const mime = require('mime');

// url: 静态文件访问路径；dir: 配置的静态文件夹
const staticFiles = (url, dir)=>{
    return async (ctx, next)=>{
        let reqPath = ctx.request.path;
        if(reqPath.startsWith(url)){
            let file = path.join(dir, reqPath.substring(url.length));
            if(await fs.exists(file)){
                //获取文件的mime类型
                ctx.response.type = mime.lookup(reqPath);
                //返回文件内容
                ctx.response.body = await fs.readFile(file);
            }else {
                ctx.response.status = 404;
            }
        }else {
            // 不是指定前缀的URL，继续处理下一个middleware:
            await next();
        }
    };
};

module.exports = staticFiles;