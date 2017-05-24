// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
const url = require('url');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const Cookies = require('cookies');
// 注意require('koa-router')返回的是函数:
const bodyParser = require('koa-bodyparser');
//auto config router with koa-router
//const router = require('koa-router')();
const controller = require('./controller');
const templating = require('./templating');

//判断是否是生产环境
const isProduction = process.env.NODE_ENV === 'production';

// 创建一个Koa对象表示web app本身:
const app = new Koa(); 

//第一个中间件：记录URL以及页面执行时间
//log request URL:
app.use(async (ctx, next)=>{
    console.log(`Process ${ctx.request.method} ${ctx.request.url} ${ctx.request.path}...`);
    let startTime = new Date().getTime(),
        execTime;
    await next();
    execTime = new Date().getTime()-startTime;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});

app.use(async (ctx, next)=>{
    ctx.state.user = parseUser(ctx.cookies.get('name') || '');
    await next();
});


//第二个中间件: 处理静态文件
//set static middleware
if(!isProduction) {
    const staticFiles = require('./staticFiles');
    app.use(staticFiles('/static/', __dirname+'/static'));
}

//第三个中间件：解析POST请求体body数据
//add bodyparser middleware:
app.use(bodyParser());
//app.use(router.routes());

//第四个中间件：给ctx对象增加render方法
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

//第五个中间件：处理路由
// add router middleware:
app.use(controller());

//监听端口3000，返回http.Server;
let server = app.listen(3000);

function parseUser(obj){
    if(!obj){
        return;
    }
    console.log(`try parse: ${obj}`);
    let s = '';
    if(typeof obj=='string'){
        s = obj;
    }else if(obj.headers){
        let cookies = new Cookies(obj, null);
        s = cookies.get('name');
    }
    if(s){
        try {
            let user = JSON.parse(Buffer.from(s, 'base64').toString());
            console.log(`User: ${user.name}, ID: ${user.id}`);
            return user;
        }catch(e) {

        }
    }
}


function createWebSocketServer(server, onConnection, onMessage, onClose, onError){
    //创建webSocketServer:
    let wss = new WebSocketServer({
        server: server
    });
    //聊天消息广播
    wss.broadcast = (data) => wss.clients.map(client=> client.send(data));

    onConnection = onConnection || function(){
        console.log(`[WebScoket] connected.`);
    };

    onMessage = onMessage || function(msg){
        console.log(`[WebScoket] message received: ${msg}`);
    };

    onClose = onClose || function(code, msg){
        console.log(`[WebScoket] closed: ${code} - ${msg}`);
    };

    onError = onError || function(err){
        console.log(`[WebScoket] error: ${err}`);
    };

    wss.on('connection', (ws, req)=>{
        console.log(ws);
        let location = url.parse(req.url, true);
        console.log(`[WebScoketServer] connection: ${location.href}`);
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        if(location.pathname !== '/ws/chat'){
            ws.close(4000, 'Invalid URL');
        }
        //check user
        let user = parseUser(req);
        if(!user){
            ws.close(4001, 'Invalid user');
        }
        ws.user = user;
        ws.wss = wss;
        onConnection.apply(ws);
    });

    console.log('WebSocketServer was attached.');

    return wss;

}

let messageIndex = 0;

function createMessage(type, user, data){
    messageIndex++;
    return JSON.stringify({
        id: messageIndex,
        type,
        user,
        data
    });
}

function onConnect(){
    let user = this.user;
    let wss = this.wss;
    let msg = createMessage('join', user, `${user.name} joined chatroom.` );
    wss.broadcast(msg);
    //build user list
    let users = wss.clients.map(client=> client.user);
    this.send(createMessage('list', user, users));
}

function onMessage(message){
    console.log(message);
    if(messagemsg && message.trim()){
        let msg = createMessage('chat', this.user, message.trim());
        this.wss.broadcast(msg);
    }
}

function onClose(code, message){
    let user = this.user;
    let msg = createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}

app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);

console.log('app started at port 3000...');