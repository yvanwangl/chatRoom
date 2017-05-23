const model = require('../model');
let User = model.User;

//请求根路径的处理函数
const fn_index = async (ctx, next)=>{
    let user = ctx.state.user;
    if(user) {
        ctx.render('room.html', {
            user: user
        });
    }else {
        ctx.response.redirect('/signin');
    }
};

// 对于任何请求，app将调用该异步函数处理请求：
const fn_login = async (ctx, next) => {
    ctx.response.body = `<h1>Index</h1>
        <form action="/signin" method="post">
            <p>Name: <input name="name" value="koa"></p>
            <p>Password: <input name="password" type="password"></p>
            <p><input type="submit" value="Submit"></p>
        </form>`;
};


//处理登录的post请求
const fn_signin = async (ctx, next)=>{
    const requestBody = ctx.request.body,
          email = requestBody.email,
          password = requestBody.password;
    if(email=='1012305328@qq.com'&&password=='123456'){
        // var user = await User.create({
        //     email: email,
        //     password: password,
        //     name: 'wangyafei',
        //     gender:1
        // });
        //登录成功
        ctx.render('signin-ok.html',{
            title: 'Sign In Ok',
            name: email
        });
    }else {
        ctx.render('signin-failed.html',{
            title: 'Sign In failed'
        });
    }
};

module.exports = {
    'GET /': fn_index,
    //'GET /login': fn_login,
    //'POST /signin': fn_signin
};