
#### Table of Contents

* [The DB Class](#The-DB-Class)
    * [Events](#Events)
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
    * [Wrap DB in Express](#Wrap-DB-in-Express)

## The DB Class

*Database Manager.*

This class provides an internal pool for connections, when a connection has 
done its job, it could be recycled and retrieved, there for saving the 
resources and speeding up the program.

### Events

- `query` Fired when [db.query()](#db_query) is called.

All the listeners bound to this event accept a parameter, which is the current
DB instance.

You can either use [DB.on()](#DB_on) or [db.on()](#db_on) to bind event 
listeners to events, but be aware of the difference they act.

### db.command

`string` *The last executed SQL command.*

### db.sql

`string` *The last executed SQL statement.*

### db.bindings

`any[]` *The binding data of the last executed SQL statement.*

### db.insertId

`number` *The ID returned by executing the last insert statement.*

### db.affectedRows

`number` *A number that represents how many records are affected by executing* 
*the last SQL statement.*

### db.dsn

`string` *Data Source Name of the current instance.*

### db.config

`DBConfig` *Database configurations of the current instance.*

### db.data

`any[]` *The data fetched by executing a select statement.*

### db.constructor()

**signatures:**

- `new DB(database: string)` Creates a new DB instance with a specified 
    database name.
- `new DB(config?: DBConfig)` Creates a new DB instance with specified 
    configurations.

`DBConfig` includes:

- `type?: string` Sets the database type (default: `sqlite`).
- `database: string` Sets the database name that needs to open.
- `protocol?: string` socket, TCP, TCPIP (default), pipe, UNIX (UNIX socket), 
    memory, etc.
- `host?: string` Sets the server name of the database.
- `port?: number` Sets the server port.
- `socketPath?: string` The path to a UNIX domain socket (if supported), when 
    `host` and `port` are missing.
- `user?: string` Sets the username that used to log in.
- `password?: string` Sets the password of the user.
- `charset?: string` Sets the charset (default: `utf8`).
- `timeout?: number` Sets both the connection timeout and query timeout 
    (default: `5000` msec.).
- `ssl?: string | { rejectUnauthorized?: Boolean, ca?: String, key?: String, cert?: String }`.
- `max?: number` (Since 1.0.7) Sets the maximum count of connections in the 
    database pool (default: `50`).
- `connectionString?: string` Customize connection string when necessary, be 
    aware different adapters support different string formats.

```javascript
var db = new DB({
    database: "./modelar.db",
});

// Also, you can pass a string to the constructor, it will be treated as the 
// database name for configuration, like this:
var db = new DB("./modelar.db"); //This is the same as above.
```

When a instance is created, the connection to the database is not yet 
established. The connection will be established when you call 
[db.connect()](#db_connect) or implicitly opened by calling 
[db.query()](#db_query).

You don't need to worry that every time you instantiate a DB or its 
subclasses like Query or Model, even subclasses of Model and so on, a new 
connection will be established, well, there will be not.

Also, DB class saves connections by there specifications, so you don't need to
worry that they will mess up in the connection pool.

#### About `connectionString`

With DB2 (ibm_db), it's a ODBC connection string look like this:：

```plain
PROTOCOL=TCPIP;HOSTNAME=localhost;PORT=5000;DATABASE=dbname;UID=db2user;PWD=password
```

With SQL Server (mssql), it supports two formats, the lagecy ADODB style:

```plain
Server=localhost,1433;Database=database;User Id=username;Password=password;Encrypt=true
```

And the URI string:

```plain
mssql://username:password@localhost:1433/database?encrypt=true
```

With MySQL/MariaDB (mysql), it also supports URI:

```plain
mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700
```

With Oracle DB (oracledb), uses a URI-like string like this:

```plain
[//]host_name[:port][/service_name][:server_type][/instance_name]
```

With PostgreSQL (postgres), also uses URI:

```plain
postgresql://dbuser:secretpassword@database.server.com:3211/mydb
```

### db.set()

*Sets database configurations for the current instance.*

**signatures:**

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

This method inherits from [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html).

### db.once()

This method inherits from [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html).

### db.emit()

**alias:**

- `db.trigger()`

This method inherits from [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html).

### db.connect()

*Acquires a connection.*

**signatures:**

- `connect(): Promise<this>`

**alias:**

- `db.acquire()`

```javascript
const { DB } = require("modelar");

var db = new DB();
db.connect().then(db=>{
    // Do stuffs here...
}).catch(err=>{
    console.log(err);
});
```

Normally, you don't have to get connection by manually calling this method,
when the [db.query()](#db_query) is called, the connection will be established
automatically.

### db.use()

*Uses a DB instance and share its connection to the database.*

**signatures:**

- `use(db: DB): this`

```javascript
const { DB } = reuiqre("modelar");

var db = new DB();
db.connect().then(db=>{
    var db2 = new DB();
    db2.use(db); // Now db2 shares the same connection with db.
});

// Since the connection will established implicitly when executing a SQL 
// statement, you can just simply do this:
var db = new DB();
var db2 = (new DB).use(db);
```

This method is meant to share connections between DB instances, so that when 
you create a new instance, you can use a connection that is already 
established instead of creating a new one, there for saving resources and 
speeding up the program.

### db.query()

*Executes a SQL statement.*

**signatures:**

- `query(sql: string, ...bindings: any[]): Promise<this>`
- `query(sql: string, bindings?: any[]): Promise<this>`
- `query(sql: DB.Statement): Promise<this>` (Added since 3.1.5)

This method is a common API to execute SQL statements in a compatible way for
all database drivers that Modelar supports, so when you are calling this 
method, must use `?` as placeholder, and put values in the `bindings`.

```javascript
const { DB } = require("modelar");

var db = new DB();

//selects
db.query("select * from users where id = ?", 1).then(db=>{
    //db has a `data` property that carries all the data that the sql 
    //fetches.
    console.log(db.data); //Print out all the data.
}).catch(err=>{
    console.log(err);
});

//inserts
db.query("insert into users (`name`, `email`) values (?, ?)", [
    "hyurl", 
    "i@hyurl.com",
]).then(db=>{
    //db has a `insertId` property that represents the insert id.
    console.log("The insert id is: " + db.insertId);
}).catch(err=>{
    console.log(err);
});

//updates
db.query("update users set `name` = ?, email = ? where `id` = ?", [
    "ayon", 
    "ayon@hyurl.com", 
    1,
]).then(db=>{
    //db has a `affectedRows` which represents the row counts that the sql 
    //affected.
    console.log(db.affectedRows + " rows were changed.");
}).catch(err=>{
    console.log(err);
});

//deletes
db.query("delete from users where `id` = ?", 1).then(db=>{
    //`affectedRows` also works in deletes.
    console.log(db.affectedRows + " rows were deleted.");
}).catch(err=>{
    console.log(err);
});
```

`DB.Statement` is an object produced by a ES6 `tagged template` string, you can 
use tag `s` to produce it, and use tag `i` (used to produce a `DB.Identifier` 
instance) to organize the SQL statement.

```javascript
const { DB, s, i } = require("modelar");

var db = new DB();

db.query(s`select * from ${i`users`} where ${i`id`} = ${1}`).then(() => {
    console.log(db.sql); // => select * from `users` where `id` = ?
    console.log(db.bindings); // => [1]
});
```

**A tip for `insertId` and `affectedRows`.**

The example given above shows you a little bit of these two properties, BUT, 
do not rely on them, because they act different with different database 
drivers. Like in PostgreSQL, `affectedRows` also contain values both in 
`insert` and `select` statements. As for `insertId`, since PostgreSQL dose not
return any IDs after inserting the record, Modelar provides a tricky way to 
get this property, but you should set a field named `id` for every table that 
you want the `insertId` to be available.

### db.transaction()

**signatures:**

- `transaction(): Promise<this>` Begins transaction.
- `transaction(cb: (db: this) => void): Promise<this>` Begins transaction and 
    handle actions in a callback function.
    - `cb` The actions in this function will be automatically handled, that 
        means if the program goes well, the transaction will be automatically 
        committed, otherwise it will be automatically rolled back.

```javascript
var db = new DB();

db.transaction(db=>{
    // Do stuffs here, if something didn't go well, you just need to 
    // throw new Error("message"), 
    // and the catch() block will be called,
    // otherwise then() block will be called.
}).then(db=>{
    // Do stuffs here if verything goes well, 
    // the transaction has been automaticallly committed.
}).catch(err=>{
    // Do stuffs here if anything goes wrong, 
    // the transaction has been automaticallly rolled back.
});

// Also, you can choose not to pass the callback function, just only start
// the transaction, and call commit() to commit and rollback() to rollback 
// manually, like this:
db.transaction().then(db=>{
    // Do stuffs here...
    // Commit if everything goes where.
    return db.commit();
}).catch(err=>{
    // Rollkack if something goes wrong.
    db.rollback();
    console.log(err);
});
```

### db.commit()

*Commits the transaction when things going well.*

**signatures:**

- `commit(): Promise<this>`

### db.rollback()

*Rolls the transaction back when things going wrong.*

**signatures:**

- `rollback(): Promise<this>`

### db.quote()

*Adds quote marks to a specified value.*

**signatures:**

- `quote(value: string): string`

```javascript
const { DB } = require("modelar");

var db = new DB();
var value = "This's is a value that needs to be quoted.";
console.log(db.quote(value));
// 'This\'s is a value that needs to be quoted.'
```

Normally this method is internally used when Modelar dealing with DDL, you're 
not going to use it, please always use bindings parameters instead.

### db.backquote()

*Adds back-quote marks to a specified identifier.*

**signatures:**

- `backquote(identifier: string): string`

```javascript
const { DB } = require("modelar");

var db = new DB();
var name = "table_name";
console.log(db.backquote(name));
// `table_name` in MySQL, "table_name" in PostgreSQL.
```

### db.close()

*Closes the the connection.*

**signatures:**

- `close(): void`

```javascript
var db = new DB();

db.query("select * from users where id is not null").then(db => {
    // Do stuffs here.
    // If there is nothing more to do, close the connection, otherwise the 
    // Node.js may hold untill the database server closes the connection.
    db.close();
});
```

### db.release()

*Releases the connection.*

**signatures:**

- `release(): void`

**alias:**

- `db.recycle()`

```javascript
const { DB } = require("modelar");

var db = new DB();
db.query("select * from `users` where `id` = ?", [1]).then(db=>{
    console.log(db.data);
    // Recycle the connection, it will be put in the internal connection pool.
    // Remember, when a connetion is closed or recycled, this instance cannot 
    // run SQL statements any more.
    db.recycle();

    var db2 = new DB();
    db2.connect(); // Now the db2's connection is exactlly the one that db 
                   // had.
}).catch(err=>{
    console.log(err);
    db.recycle();
});
```

### DB.init()

*Initiates database configurations for all instances.*

**signatures:**

- `init(config: DBConfig): typeof DB`

```javascript
const { DB } = require("modelar");

DB.init({
    type: "mysql", // Support mysql, maria and postgres by default.
    host: "localhost",
    port: 3306,
    user: "user",
    password: "",
    database: "modelar",
});
```

The difference between the `db.constructor()`,  `db.set()` and `DB.init()` is 
that the former two only sets the configuration for one instance, while 
`DB.init()` will initiate all instances.

Since 3.0, static methods like [DB.init()](#DB_init), 
[DB.setAdapter()](#DB_setAdapter), [DB.on()](#DB_on) and 
[DB.destroy()](#DB_destroy) only affect the instances of the current class or 
subclasses, that means if you called `Model.init()`, only models will be 
initiated, while `DB` and `Query` instances will not.

### DB.setAdapter()

*Sets adapter for a specified database type.*

**signatures:**

- `setAdapter(type: string, adapter: Adapter): typeof DB`

```javascript
const MssqlAdapter = require("modelar-mssql-adapter");

DB.setAdapter("mssql", MssqlAdapter);
```

### DB.on()

*Binds a listener to an event for all instances.*

**signatures:**

- `on(event: string | symbol, listener: (...args: any[]) => void): typeof DB`

```javascript
const { DB } = require("modelar");

DB.on("query", db => {
    // Make a log when a SQL statement is run.
    // `db.sql` is the SQL statement while `db.bindings` is an array of values
    // bound to it.
    console.log(db.sql, db.bindings);
});
```

### DB.close()

*Closes all connections in all pools.*

**signatures:**

- `close(): void`

**alias:**

- `DB.destroy()`

### Wrap DB in Express

Node.js is a single-threaded program, when it comes to multi-clients server 
programing, you cannot tell when and where the state of an static object is 
in place, so you have to create an instance which has its own state instead.

What I'm talking about is, a connection to the database must be unique for 
each request on the server, even if they can be shared with different 
requests, but only if they are done with one particular request.

In this case, you must create a new DB instance and make connect for each 
request, and pass it through the request. Also, DB provides an internal pool
for connections, when a connection has done its job, it could be recycled and
retrieved by the next request.

```javascript
const express = require("express");
const app = express();
const { DB, User } = require("modelar");

// Define an Express middleware to store the connection for each request.
app.use((req, res, next) => {
    // Make a connection to the database, store it in the req.db property.
    req.db = new DB();

    // Add an event handler that when the response has been sent, recycle the 
    // connection and wait for the next request to retrieve it.
    res.on("finish", () => {
        req.db.release();
    });

    next();
});

// Define a route to get a user by its UID.
app.get("/user/:id", (req, res) => {
    // Use the existing conneciton.
    User.use(req.db).get(req.params.id).then( user =>{
        // If user exists and has been fetched, this code block will run.
        res.json({
            success: true,
            data: user,
        });
    }).catch(err => {
        // If user doesn't exist or other errors occured, this code block 
        // runs.
        res.json({
            success: false,
            msg: err.message,
        });
    });
});

// Start server, listening 3000.
var server = app.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s", host, port);
});
```

This is just a simple example for Express, if you're using other framework, 
say `Socket.io`, they are pretty much the same, just wrap the DB in their 
function scopes, and don't forget to close or recycle connections when the 
response has been sent to the client.