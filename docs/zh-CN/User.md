
#### 内容列表

* [The User Class](#The-User-Class)
    * [user.login()](#user_login)

## User 类

*用户模型*

这个模型用来处理用户数据，它提供了一个 `login()` 方法，可以让你用来登录网站。

同时，User 类也是一个非常好使用 Modelar 的示例，你可以查看它的源码，学习它到底做了
什么事情，然后去尝试定义你自己的模型类。

### user.login()

*尝试登录一个用户。*

如果成功，一个 `login` 事件将会被触发；如果失败，将抛出一个错误来表示失败原因。这个
方法不会将用户信息保存到 session 或者其它的存储介质中，如果你想要它这么做，你必须自己来实现。

**参数：**

- `args` 这个参数可以携带一个或者更多的可用于登录的 (`loginable`) 字段和值，并且
    必须同时传递一个 `password` 字段。如果没有可用于登录的字段被传入，那么则需要传入
    一个 `user` 键值对，意味着将要自动尝试所有的可能性。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是登录成功的用户实例。

```javascript
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const { DB, User } = require("modelar");
const app = express();

// 解析请求主体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 处理 Session
app.use(session({
    secret: "modelar",
    name: "modelar-id",
    resave: false,
    saveUninitialized: true,
}));

// 定义一个 Express 中间件来为每一个请求存储数据库连接。
app.use((req, res, next)=>{
    // 创建一个到数据库的连接，并将其保存到 req.db 属性上。
    req.db = new DB();
    
    // 添加一个事件处理器，当服务端响应发送给客户端之后，回收数据库连接，并等待下一个
    // 请求重新使用它。
    res.on("finish", () => {
        req.db.recycle();
    });

    next();
});

/** 登录一个用户 */
var doLogin = (req, res)=>{
    User.use(req.db).login(req.body).then(user=>{
        req.session.UID = user.id; // 保存 UID 到 Session 中。
        res.json({
            success: true,
            msg: "User logged in.",
            data: user.valueOf()
        });
    }).catch(err=>{
        res.json({
            success: false,
            msg: err.message,
        });
    });
};

app.post("/login", (req, res)=>{
    if(req.session.UID === undefined){
        // 如果用户没有登录，则进行登录。
        doLogin(req, res);
    }else{
        // 如果用户已登录，则尝试取回其数据。
        User.use(req.db).get(req.session.UID).then(user=>{
            res.json({
                success: true,
                msg: "User logged in.",
                data: user.valueOf()
            });
        }).catch(err=>{
            doLogin(req, res);
        });
    }
});

app.get("/logout", (req, res)=>{
    delete req.session.UID;
    res.json({
        success: true,
        msg: "User logged out.",
    });
});

// 开启服务器，监听 3000 端口。
var server = app.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s", host, port);
});
```