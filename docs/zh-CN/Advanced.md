在这篇文章中，我将会跟你介绍一些巧妙但非常有用的示例，来加深你对 Modelar 的印象。

### 获取父模型和子模型

这个特性是通过 [model.has()](/Docs/TheModelClass#model_has) 和
[model.belongsTo()](/Docs/TheModelClass#model_belongsTo) 来实现的。

```javascript
const { DB, Model } = require("modelar");

DB.init({
    type: "sqlite",
    database: "./modelar.db",
});

var db = new DB;

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            // 在模型的字段中设置一个 `parent_id`。
            fields: ["id", "name", "email", "password", "parent_id"],
            searchable: ["name", "email"]
        });
    }

    get parent() {
        // 传递当前类为关联的模型类，然后传递 `parent_id` 作为外键。
        return this.belongsTo(User, "parent_id");
    }

    get children() {
        return this.has(User, "parent_id");
    }
}

// 获取 ID 为 1 的用户。
User.use(db).get(1).then(user => {
    // 打印用户的信息：
    console.log(user.valueOf());

    // 获取所有用户的子模型：
    user.children.all().then(children => {
        // 打印所有子模型的信息：
        for (let child of children) {
            console.log(child.valueOf());
        }
    });
});

// 获取 ID 为 2 的用户。
User.use(db).get(2).then(user => {
    console.log(user.valueOf());

    // 获取用户的父模型：
    user.parent.get().then(parent => {
        console.log(parent.valueOf());
    });
});
```

### 在 Socket.io 中使用 Modelar

这个示例向你展示如果在 Socket.io 中处理 Modelar。为了方便，我将会为每一个客户端都
创建一个数据库连接，然后将所有的这些连接存储到一个变量中，并通过 Socket ID 类标识
它们。当使用 Modelar 来从数据库获取数据时，从这个变量中取回数据库连接。

在服务器端，我们这样做：

```javascript
// 这个程序也使用 Express。
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { DB, User } = require("modelar");

// 这个变量用来为 socket 客户端存储数据库连接。
const connections = {};

DB.init({
    type: "sqlite",
    database: "./modelar.db",
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// 开启 HTTP 服务器，监听 3000 端口。
server.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s.", host, port);
});

//开启 WebSocket 服务器。
io.on('connection', function(socket) {
    if (connections[socket.id] === undefined) {
        connections[socket.id] = new DB;
    }
    socket.on("disconnect", reason => {
        // 当连接被关闭时，回收数据库连接。
        connections[socket.id].recycle();
    });
    socket.emit("news", "Hello, World!");
    socket.on("get-user", data => {
        User.use(connections[socket.id]).get(data.UID).then(user => {
            // 向客户端发送用户信息。
            socket.emit("get-user", user);
        });
    });
});
```

而在客户端 (index.html) 中，我们这样做：

```javascript
// 必须先导入 socket.io。
var socket = io('http://127.0.0.1:3000');

socket.on('get-user', function(user) {
    // 在浏览器控制台中打印用户信息：
    console.log(user);
});
socket.on("news", function(data) {
    console.log(data);
    // 向服务端发送一个带 UID 的请求：
    socket.emit("get-user", { UID: 1 });
});
```

### 在 Modelar 中使用 Async/Await 或者 Co

自 Node.js 7.6.0 起，你可以使用 `async/await` 来处理异步的操作，在这之前，则可以
使用 `co` 模块来实现替代的效果。

```javascript
const { User } = require("modelar");

User.init({
    type: "mysql",
    database: "test",
    host: "localhost",
    port: 3306,
    user: "root",
    password: ""
});

// 使用 async/await
(async() => {
    var user = await User.get(1);
    console.log(user);
    user.close();
})();

// 如果你使用 co，它将会是像这样的：
const co = require("co");

co(function*() {
    var user = yield User.get(1);
    console.log(user);
    user.close();
});
```