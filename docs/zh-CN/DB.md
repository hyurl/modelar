
#### 内容列表

* [The DB Class](#The-DB-Class)
    * [db.constructor()](#db_constructor)
    * [DB.init()](#DB_init)
    * [DB.on()](#DB_on)
    * [db.on()](#db_on)
    * [db.once()](#db_once)
    * [db.emit()](#db_emit)
    * [db.connect()](#db_connect)
    * [db.use()](#db_use)
    * [db.query()](#db_query)
    * [db.transaction()](#db_transaction)
    * [db.commit()](#db_commit)
    * [db.rollback()](#db_rollback)
    * [db.quote()](#db_quote)
    * [db.backquote()](#db_backquote)
    * [db.close()](#db_close)
    * [db.release()](#db_release)
    * [DB.destroy()](#DB_destroy)
    * [预定义事件](#预定义事件)
    * [在 Express 中包裹 DB](#在-Express-中包裹-DB)

## DB 类

*数据库管理器*

这个类提供了一个内部的连接池来管理数据库连接，当一个连接完成其工作之后，它可以被回收
并等待下一次取回重复使用，这样可以节省资源并提供程序的运行速度。

### db.constructor()

*通特定的配置来创建一个新的数据库实例。*

**参数：**

- `[config]` 一个携带着配置信息的对象，它们仅对当前实例有效，或者设置一个字符串来
    表示只设置数据库名。

```javascript
var db = new DB({
    database: "modelar",
});

// 另外，你也可以传递一个字符串到构造方法中，特将会被视为配置中的数据库名，就像这样：
var db = new DB("modelar");
```
所有支持的的配置选项包括：

- `type` 设置数据库类型（默认：`mysql`）。
- `database` 设置需要打开的数据库名称。
- `host` 设置数据库服务器的主机名称。
- `port` 设置服务器的端口。
- `user` 设置用于登录数据库的用户名。
- `password` 设置用户对应的密码。
- `charset` 设置数据库采用的字符集（默认：`utf8`）。
- `timeout` 同时设置连接的超时时长和查询的超时时长（默认：`5000` 毫秒）。
- `ssl` SSL 选项支持包括：`{ rejectUnauthorized: Boolean, ca: String, key: String, cert: String }`。
- `max` 设置数据库连接池的最大连接数（默认：`50`）。

当一个实例被创建的时候，数据库连接并不会被建立。数据库连接将会在你调用 
[db.connect()](#db_connect) 时被创建，或者调用 [db.query()](#db_query) 时被隐式地
创建。

你不必担心每一次你实例化一个 DB 类或者它的子类如 Query 或 Model 等的时候，一个新的
连接会被创建，这并不会。

另外，DB 类保存连接是根据连接的描述符来区分的，因此你不需要担心它们在连接池中会造成
混乱。

### DB.init()

*为所有的数据库实例初始化配置。*

**参数：**

- `config` 一个携带配置信息的对象。

**返回值：**

返回类自身以便能够实现方法的链式调用。

```javascript
const { DB } = require("modelar");

DB.init({
    type: "mysql", // 默认支持 mysql、maria 和 postgres
    host: "localhost",
    port: 3306,
    user: "user",
    password: "",
    database: "modelar",
});
```

`db.constructor()` 与 `DB.init()` 的不同之处在于，`db.constructor()` 仅仅设置了
当前实例的配置信息，而 `DB.init()` 则会为所有实例进行初始化。

### DB.on()

*将一个事件监听器函数绑定到所有数据库实例的指定事件上。*

**参数：**

- `event` 事件名称。
- `callback` 一个将会在事件触发时被运行的回调函数。

**返回值：**

返回类自身以便能够实现方法的链式调用。

```javascript
const { DB } = require("modelar");

DB.on("query", db => {
    // 当 SQL 语句运行时输出日志。
    // `db.sql` 即是被运行的 SQL 语句，而 `db.bindings` 则是绑定到它上面的参数，
    // 为一个数组。
    console.log(db.sql, db.bindings);
});
```

### db.on()

*将一个事件监听器函数绑定到指定事件上。*

**参数：**

- `event` 事件名称。
- `callback` 一个将会在事件触发时被运行的回调函数。

**returns:**

返回当前实例以便实现方法的链式调用。

这个方法继承自 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html)。

```javascript
const { DB } = require("modelar");

var db = new DB();
db.on("query", db=>{
    // 打印 SQL 语句及其绑定参数。
    console.log(db.sql, db.bindings);
});
```

### db.once()

*将一个只会运行一次的事件监听器函数绑定到指定事件上。*

**参数：**

- `event` 事件名称。
- `callback` 一个将会在事件触发时被运行的回调函数。

**returns:**

返回当前实例以便实现方法的链式调用。

这个方法继承自 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html)。

```javascript
const { DB } = require("modelar");

var db = new DB();
db.on("query", db=>{
    // 打印 SQL 语句及其绑定参数。
    console.log(db.sql, db.bindings);
});
```

### db.emit()

*触发一个事件并执行其事件监听器函数。*

**参数：**

- `event` 事件名称。
- `...args` 传递到事件监听器函数的参数。

**返回值：**

如果事件有监听器，返回 `true`，否则为 `false`。

**别名：**

- `db.trigger()`

这个方法继承自 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html)。

### db.connect()

*获取一个数据库连接。*

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是当前实例。

```javascript
const DB = require("modelar/DB");

var db = new DB("./modelar.db");
db.connect().then(db=>{
    // 在这里做其他事情...
}).catch(err=>{
    console.log(err);
});
```

一般地，你不需要通过调用该方法来手动建立连接，当 [db.query()](#db_query) 被调用时，
数据库连接将会被自动建立。

### db.use()

*使用一个数据库实例并共享它的数据库连接。*

**参数**

- `db` 一个已经创建的数据库实例。

**返回值：**

返回当前实例以便实现方法的链式调用。

```javascript
const { DB } = reuiqre("modelar");

var db = new DB();
db.connect().then(db=>{
    var db2 = new DB();
    db2.use(db); // 现在 db2 和 db 共享同一个数据库连接。
});

// 由于连接会在执行 SQL 语句时隐式地建立，你也可以直接这样做：
var db = new DB();
var db2 = (new DB).use(db);
```

这个方法是用来在不同的数据库实例之间共享它们的连接，从而可以在你创建新实例的时候，你
可以使用一个现有的连接，而不是从新建立一个，这样可以节省资源并提升程序的运行速度。

### db.query()

*执行一条 SQL 语句。*

**参数：**

- `sql` 待执行的 SQL 语句。
- `[...bindings]` 绑定到 SQL 语句上的参数。

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是当前实例。

这个方法是一个通用的 API，用来执行 SQL 语句，并以兼容的方式来适配所有 Modelar 支持的
数据库，因此当你调用这个方法的时候，务必始终使用 `?` 作为占位符，然后把值存放在
`bindings` 中。

```javascript
const { DB } = require("modelar");

var db = new DB();

// selects
db.query("select * from users where id = ?", 1).then(db=>{
    // db 拥有一个 _data 属性，用来保存 SQL 执行后从数据库获取到的所有数据。
    console.log(db._data); // 打印所有数据
}).catch(err=>{
    console.log(err);
});

// inserts
db.query("insert into users (`name`, `email`) values (?, ?)", [
    "hyurl", 
    "i@hyurl.com",
]).then(db=>{
    // db 拥有一个 `insertId` 属性，它表示插入数据的 id。
    console.log("The insert id is: " + db.insertId);
}).catch(err=>{
    console.log(err);
});

// updates
db.query("update users set `name` = ?, email = ? where `id` = ?", [
    "ayon", 
    "ayon@hyurl.com", 
    1,
]).then(db=>{
    // db 拥有一个 `affectedRows` 属性，它表示 SQL 语句执行后影响的记录行数。
    console.log(db.affectedRows + " rows were changed.");
}).catch(err=>{
    console.log(err);
});

// deletes
db.query("delete from users where `id` = ?", 1).then(db=>{
    // `affectedRows` 属性也可以在删除操作中使用。
    console.log(db.affectedRows + " rows were deleted.");
}).catch(err=>{
    console.log(err);
});
```

**一个关于 `insertId` 和 `affectedRows` 的提示**

上面给出的示例，向你展示了一些关于这两个属性的东西，但是，不要依赖它们，因为它们会
由于数据库驱动的不同而产生不同的表现。像在 PostgreSQL 数据库中，`affectedRows` 同样
在 `insert` 和 `select` 语句中返回值。而对于 `insertId`，由于 PostgreSQL 在插入
记录后不返回任何 ID，Modelar 提供了一个偏门的技巧来获取这个属性，但是你应该为所有想
要返回 `insertId` 的数据表设置一个`id` 字段。

### db.transaction()

*开启一个事务并处理内部的操作。*

**参数：**

- `[callback]` 如果传递了一个函数，那么它内部的代码将会被自动的处理，这意味着，如果
    程序进展顺利，那么事务就会被自动提交，否则它将被自动地回滚。如果没有传递回调函数，
    那么将只开启事务，这意味着你必须要手动地提交或者回滚事务。

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是当前实例。

```javascript
var db = new DB();

db.transaction(db=>{
    // 在这里做你想做的事，如果程序进展不顺利，你只需要 
    // throw new Error("message")， 
    // 然后 catch() 代码块将会被调用，
    // 否则 then() 代码块将会被调用。
}).then(db=>{
    // 如果一切都进展顺利，在这里继续，事务已经被自动提交了。
}).catch(err=>{
    // 如果进展不顺利，在这里继续，事务已经被自动回滚了。
});

// 另外，你也可以选择不传入回调函数，而只仅仅开启事务，然后手动调用 commit() 来提交，
// 或者调用 rollback() 来回滚。就像这样。
db.transaction().then(db=>{
    // 在这里做你想做地事，如果一切进展顺利则提交。
    return db.commit();
}).catch(err=>{
    // 如果进展不顺利则回滚。
    db.rollback();
    console.log(err);
});
```

### db.commit()

*提交事务。*

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是当前实例。

### db.rollback()

*回滚事务。*

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是当前实例。

### db.quote()

*为一个特定的值添加引号。*

**参数：**

- `value` 需要使用引号包裹的值。

**返回值：**

加了引号的值。

```javascript
const { DB } = require("modelar");

var db = new DB();
var value = "This's is a value that needs to be quoted.";
console.log(db.quote(value));
//'This\'s is a value that needs to be quoted.'
```

### db.backquote()

*为一个特定的标识符添加反引号。*

**参数：**

- `identifier` 一个需要使用反引号包裹的标识符（表名或字段名）。

**返回值：**

加了反引号的值。

```javascript
const { DB } = require("modelar");

var db = new DB();
var name = "table_name";
console.log(db.quote(name));
// 在 MySQL 中是 `table_name`，而在 PostgreSQL 中则是 "table_name"。
```

### db.close()

*关闭当前实例的数据库连接。*

该方法没有返回值。

```javascript
var db = new DB();

db.query("select * from users where id is not null").then(db => {
    // 在这里做你想做的事。
    // 如果没有其他事情需要去做，那么就关闭连接，否则 Node。js 将可能会挂起，直到
    // 数据库服务器关闭连接。
    db.close();
});
```

### db.release()

*回收当前实例的数据库连接。*

**别名：**

- `db.recycle()`

该方法没有返回值。

```javascript
const { DB } = require("modelar");

var db = new DB();
db.query("select * from `users` where `id` = ?", 1).then(db=>{
    console.log(db._data);
    // 回收数据库连接，它将会被存放到内部的连接池中。记住，当一个连接被关闭或者回收
    // 之后，当前实例就不能再执行 SQL 语句了。
    db.recycle();

    var db2 = new DB();
    db2.connect(); // 现在 db2 的连接就是之前 db 的连接。
}).catch(err=>{
    console.log(err);
    db.recycle();
});
```

### DB.destroy()

*销毁所有连接池中的所有数据库连接。*

**别名：**

- `DB.close()`

该方法没有返回值。

### 预定义事件

在 DB 层面上，只有一个事件 `query`，当每一次调用 [db.query()](#db_query) 来运行
SQL 语句时，这个事件就会被触发并调用绑定到它上面的所有事件处理函数。

你可以使用 [DB.on()](#DB_on) 或者 [db.on()](#db_on) 来绑定事件监听函数到这个事件
上，但是请注意区分它们的不同表现。

### 在 Express 中包裹 DB

Node.js 是一个单线程软件，当进行多客户端的服务器编程时，你无法确定什么时候、在哪里，
一个静态对象的状态处在了合适的位置，因此你必须创建一个拥有自己的状态的实例。

我说这个的意思是，服务器上的每一个数据库连接必须是独立于每一个请求的，即使它们可以
在不同请求之间共享，但那也必须等到一个请求完成了它的工作。

这这种情况下，你必须为每一个请求都创建一个新的 DB 实例并建立连接，然后在这个特有的
请求过程中传递它。同时，DB 类提供了一个内部的数据库连接池，当当前连接完成了它的工作
之后，它可以被回收并等待下一个请求重新取回它。

```javascript
const express = require("express");
const app = express();
const { DB, User } = require("modelar");

// 定义一个 Express 中间件来保存数据库连接。
app.use((req, res, next)=>{
    // 创建数据库连接，将它保存在 req.db 属性中。
    req.db = new DB();

    // 添加一个时间处理器，当响应被发送回客户端后，回收数据库连接并等待下一个请求
    // 取回它。
    res.on("finish", () => {
        req.db.recycle();
    });

    next();
});

// 定义一个路由用来通过 UID 获取一个用户。
app.get("/user/:id", (req, res)=>{
    // 使用现有数据库连接。
    User.use(req.db).get(req.params.id).then(user=>{
        // 如果用户存在并被获到，这个代码块将会被运行。
        res.json({
            success: true,
            data: user.valueOf(),
        });
    }).catch(err=>{
        // 如果用户不存在或者发生了其他错误，这个代码块将会被运行。
        res.json({
            success: false,
            msg: err.message,
        });
    });
});

// 开启服务器，监听 3000 端口。
var server = app.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s", host, port);
});
```

这只是一个简单的 Express 应用的示例，如果你使用其它的框架，比如说 `Socket.io`，它们
基本上也差不多，只要将 DB 包裹在它们的函数作用域内即可，然后不要忘了在响应发送回
客户端之后关闭或者回收数据库连接。