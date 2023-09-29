
#### 内容列表

* [The DB Class](#The-DB-Class)
    * [事件](#事件)
    * [db.command](#db_command)
    * [db.sql](#db_sql)
    * [db.bindings](#db_bindings)
    * [db.insertId](#db_insertId)
    * [db.affectedRows](#db_affectedRows)
    * [db.dsn](#db_dsn)
    * [db.config](#db_config)
    * [db.data](#db_data)
    * [db.constructor()](#db_constructor)
    * [db.set()](#db_set)
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
    * [DB.init()](#DB_init)
    * [DB.setAdapter()](#DB_setAdapter)
    * [DB.on()](#DB_on)
    * [DB.close()](#DB_close)
    * [在 Express 中包裹 DB](#在-Express-中包裹-DB)

## DB 类

*数据库管理器*

这个类提供了一个内部的连接池来管理数据库连接，当一个连接完成其工作之后，它可以被回收
并等待下一次取回重复使用，这样可以节省资源并提高程序的运行速度。

### 事件

- `query` 当 [db.query()](#db_query) 被调用时触发。

所有绑定到这个事件上的监听器函数都接受一个参数，即当前的 DB 实例。

你可以使用 [DB.on()](#DB_on) 或者 [db.on()](#db_on) 来绑定事件监听函数到事件上，
但是需要注意区分它们的不同表现。

### db.command

`string` *上一次执行的 SQL 命令。*

### db.sql

`string` *上一次执行的 SQL 语句。*

### db.bindings

`any[]` *上一次执行的 SQL 语句中绑定参数的数据。*

### db.insertId

`number` *上一次插入语句执行后返回的 ID。*

### db.affectedRows

`number` *一个数字，表示上一次执行的 SQL 语句影响的行数。*

### db.dsn

`string` *当前实例的数据源名称。*

### db.config

`DBConfig` *当前实例的数据库配置。*

### db.data

`any[]` *执行一条查询语句后取得的数据。*

### db.constructor()

**签名：**

- `new DB(database: string)` 使用一个数据库名称来创建一个新的数据库实例。
- `new DB(config?: DBConfig)` 使用指定的数据库配置来创建数据库实例。

`DBConfig` 包括：

- `type?: string` 设置数据库类型（默认：`mysql`）。
- `database: string` 设置需要打开的数据库名称。
- `protocol?: string` socket、TCP、TCPIP (default)、pipe、UNIX (UNIX socket)、
    memory，等等.
- `host?: string` 设置数据库服务器的主机名称。
- `port?: number` 设置服务器的端口。
- `socketPath?: string` 指向 UNIX domain socket (如果支持)，当 `host` 和 `port` 
    未提供时需要。
- `user?: string` 设置用于登录数据库的用户名。
- `password?: string` 设置用户对应的密码。
- `charset?: string` 设置数据库采用的字符集（默认：`utf8`）。
- `timeout?: number` 同时设置连接的超时时长和查询的超时时长（默认：`5000` 毫秒）。
- `ssl?: string | { rejectUnauthorized?: Boolean, ca?: String, key?: String, cert?: String }`。
- `max?: number` 设置数据库连接池的最大连接数（默认：`50`）。
- `connectionString?: string` 当需要时自定义连接字符串，需要注意不同的适配器支持
    不同的连接字符串格式。

```javascript
var db = new DB({
    database: "modelar",
});

// 另外，你也可以传递一个字符串到构造方法中，特将会被视为配置中的数据库名，就像这样：
var db = new DB("modelar");
```

当一个实例被创建的时候，数据库连接并不会被建立。数据库连接将会在你调用 
[db.connect()](#db_connect) 时被创建，或者调用 [db.query()](#db_query) 时被隐式地
创建。

你不必担心每一次你实例化一个 DB 类或者它的子类如 Query 或 Model 等的时候，一个新的
连接会被创建，这并不会。

另外，DB 类保存连接是根据连接的描述符来区分的，因此你不需要担心它们在连接池中会造成
混乱。

#### 关于 `connectionString`

在 DB2 (ibm_db) 中，它为一个 ODBC 连接字符串，格式类似下面这样：

```plain
PROTOCOL=TCPIP;HOSTNAME=localhost;PORT=5000;DATABASE=dbname;UID=db2user;PWD=password
```

在 SQL Server (mssql) 中，它支持两种格式，一种是传统的 ADODB 形式：

```plain
Server=localhost,1433;Database=database;User Id=username;Password=password;Encrypt=true
```

另一种是 URI 形式：

```plain
mssql://username:password@localhost:1433/database?encrypt=true
```

在 MySQL/MariaDB (mysql) 中，也是支持 URI 形式：

```plain
mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700
```

在 Oracle DB (oracledb) 中，使用如下的类 URI 形式：

```plain
[//]host_name[:port][/service_name][:server_type][/instance_name]
```

在 PostgreSQL (postgres) 中，同样使用 URI 形式：

```plain
postgresql://dbuser:secretpassword@database.server.com:3211/mydb
```

### db.set()

*为当前实例设置数据库配置信息。*

**签名：**

- `set(config: DBConfig): this`
- `set(name: string, value: any): this`

```javascript
var db = new DB;

db.set("host", "localhost");
db.set({
    host: "localhost"
});
```

### db.on()

这个方法继承自 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html)。

### db.once()

这个方法继承自 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html)。

### db.emit()

**别名：**

- `db.trigger()`

这个方法继承自 [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html)。

### db.connect()

*获取一个数据库连接。*

**签名：**

- `connect(): Promise<this>`

```javascript
const { DB } = require("modelar");

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

**签名：**

- `use(db: DB): this`

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

**签名：**

- `query(sql: string, ...bindings: any[]): Promise<this>`
- `query(sql: string, bindings?: any[]): Promise<this>`
- `query(sql: DB.Statement): Promise<this>` (新增与 3.1.5)

这个方法是一个通用的 API，用来执行 SQL 语句，并以兼容的方式来适配所有 Modelar 支持的
数据库，因此当你调用这个方法的时候，务必始终使用 `?` 作为占位符，然后把值存放在
`bindings` 中。

```javascript
const { DB } = require("modelar");

var db = new DB();

// selects
db.query("select * from users where id = ?", 1).then(db=>{
    // db 拥有一个 data 属性，用来保存 SQL 执行后从数据库获取到的所有数据。
    console.log(db.data); // 打印所有数据
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

`DB.Statement` 是一个通过 ES6 `tagged template` 字符串产生的对象，你可以通过 `s` 
标签来产生这个对象，并且通过 `i` （用于产生 `DB.Identifier` 对象） 标签来组织 SQL 
语句。

```javascript
const { DB, s, i } = require("modelar");

var db = new DB();

db.query(s`select * from ${i`users`} where ${i`id`} = ${1}`).then(() => {
    console.log(db.sql); // => select * from `users` where `id` = ?
    console.log(db.bindings); // => [1]
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

**签名：**

- `transaction(): Promise<this>` 开启事务。
- `transaction(cb: (db: this) => void): Promise<this>` 开启事务并自动处理回调
    函数中的操作。
    - `cb` 这个函数内部的操作将会被自动地处理，这意味着，如果程序进展顺利，那么事务
        就会被自动提交，否则它将被自动地回滚。

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

*在程序进展顺利时提交事务。*

**签名：**

- `commit(): Promise<this>`

### db.rollback()

**签名：**

- `rollback(): Promise<this>`

### db.quote()

*为一个指定的值添加引号。*

**签名：**

- `quote(value: string): string`

```javascript
const { DB } = require("modelar");

var db = new DB();
var value = "This's is a value that needs to be quoted.";
console.log(db.quote(value));
//'This\'s is a value that needs to be quoted.'
```

一般来说这个方法是 Modelar 内部在拼接 DDL 时使用的，你不会用到，请始终使用绑定参数的
方式进行传值。

### db.backquote()

*为一个指定的标识符添加反引号。*

**签名：**

- `backquote(identifier: string): string`

```javascript
const { DB } = require("modelar");

var db = new DB();
var name = "table_name";
console.log(db.backquote(name));
// 在 MySQL 中是 `table_name`，而在 PostgreSQL 中则是 "table_name"。
```

### db.close()

*关闭当前实例的数据库连接。*


**签名：**

- `close(): void`

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

*释放当前实例的数据库连接。*

**签名：**

- `release(): void`

**别名：**

- `db.recycle()`

```javascript
const { DB } = require("modelar");

var db = new DB();
db.query("select * from `users` where `id` = ?", 1).then(db=>{
    console.log(db.data);
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

### DB.init()

*为所有的实例初始化数据库配置。*

**签名：**

- `init(config: DBConfig): typeof DB`

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

`db.constructor()` 以及 `db.set()` 与 `DB.init()` 的不同之处在于，前两者仅仅设置了
当前实例的配置信息，而 `DB.init()` 则会为所有实例进行初始化。

自 3.0 版本起，静态方法如 [DB.init()](#DB_init)、
[DB.setAdapter()](#DB_setAdapter)、[DB.on()](#DB_on) 以及 
[DB.destroy()](#DB_destroy) 只会影响到当前类或其子类的实例，这意味着如果你调用 
`Model.init()`，只有模型才会被初始化配置，而 `DB` 和 `Query` 类的实例则不会。

### DB.setAdapter()

*为指定的数据库类型设置适配器。*

**签名：**

- `setAdapter(type: string, adapter: Adapter): typeof DB`

```javascript
const MssqlAdapter = require("modelar-mssql-adapter");

DB.setAdapter("mssql", MssqlAdapter);
```

### DB.on()

*将一个事件监听器函数绑定到所有实例的指定事件上。*

**签名：**

- `on(event: string | symbol, listener: (...args: any[]) => void): typeof DB`

```javascript
const { DB } = require("modelar");

DB.on("query", db => {
    // 当 SQL 语句运行时输出日志。
    // `db.sql` 即是被运行的 SQL 语句，而 `db.bindings` 则是绑定到它上面的参数，
    // 为一个数组。
    console.log(db.sql, db.bindings);
});
```

### DB.close()

*销毁所有连接池中的数据库连接。*

**签名：**

- `close(): void`

**别名：**

- `DB.destroy()`

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
app.use((req, res, next) => {
    // 创建数据库连接，将它保存在 req.db 属性中。
    req.db = new DB();

    // 添加一个事件处理器，当响应被发送回客户端后，回收数据库连接并等待下一个请求
    // 取回它。
    res.on("finish", () => {
        req.db.release();
    });

    next();
});

// 定义一个路由用来通过 UID 获取一个用户。
app.get("/user/:id", (req, res) => {
    // 使用现有数据库连接。
    User.use(req.db).get(req.params.id).then(user => {
        // 如果用户存在并被获到，这个代码块将会被运行。
        res.json({
            success: true,
            data: user,
        });
    }).catch(err => {
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