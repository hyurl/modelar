
#### 内容列表

* [The User Class](#The-User-Class)
    * [Events](#Events)
    * [User.loginable](#User_loginable)
    * [user.constructor()](#user_constructor)
    * [user.login()](#user_login)
    * [User.login()](#User_login)

## User 类

*用户模型*

这个模型用来处理用户数据，它提供了一个 `login()` 方法，可以让你用来登录网站。

同时，User 类也是一个非常好使用 Modelar 的示例，你可以查看它的源码，学习它到底做了
什么事情，然后去尝试定义你自己的模型类。

### 事件

- `login` 当用户登录成功后触发。

### User.loginable

`string[]` 设置所有可能的字段，当调用 `user.login()` 并传递 `user` 字段时使用。

### user.constructor()

**signatures:**

- `constructor()`
- `constructor(data: { [field: string]: any })`
- `constructor(data: { [field: string]: any }, config: ModelConfig)`

```javascript
var user1 = new User;
var user2 = new User({
    name: "luna",
    email: "luna@hyurl.com"
});

class Member extends User {
    constructor(data = {}) {
        super(data, {
            table: "members",
            fields: ["id", "name", "email", "password", "gender", "age"],
            searchable: ["name", "email"]
        });
    }
}
```

### user.login()

*尝试登录一个用户。*

**signatures:**

- `login(options: { [field: string]: string, user?: string, password: string }): Promise<this>`

默认地，`name` 和 `email` 可以用来进行登录，如果它们都没有被提供，那么则应该传入一个
`user` 属性，它将会尝试所有可能性。你可以修改属性 `User.loginable` 来改变可用的登录
字段。这个属性也同样遵循类分层树的规则，因此如果你有一个 
`class Member extrends User{}`，那么 `Member.loginable` 将会被首先使用。

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

### User.login()

`(new User).login()` 的一个简写方式。