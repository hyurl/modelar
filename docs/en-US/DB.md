
#### Table of Contents

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
    * [Pre-defined Events](#Pre-defined-Events)
    * [Wrap DB in Express](#Wrap-DB-in-Express)

## The DB Class

*Database Connection Manager.*

This class provides an internal pool for connections, when a connection has 
done its job, it could be recycled and retrieved, there for saving the 
resources and speeding up the program.

### db.constructor()

*Creates a new instance with specified configurations.*

**parameters:**

- `[config]` An object that carries configurations for the current instance, 
    or a string that sets only the database name.

```javascript
var db = new DB({
    database: "./modelar.db",
});

// Also, you can pass a string to the constructor, it will be treated as the 
// database name for configuration, like this:
var db = new DB("./modelar.db"); //This is the same as above.
```

All supported configurations are:

- `type` Sets the database type (default: `sqlite`).
- `database` Sets the database name that needs to open.
- `host` Sets the server name of the database.
- `port` Sets the server port.
- `user` Sets the username that used to log in.
- `password` Sets the password of the user.
- `charset` Sets the charset (default: `utf8`).
- `timeout` Sets both the connection timeout and query timeout(default: `5000`
    msec.).
- `ssl` SSL option supports: `{ rejectUnauthorized: Boolean, ca: String, key: String, cert: String }`.
- `max` (Since 1.0.7) Sets the maximum count of connections in the database 
    pool (default: `50`).

When a instance is created, the connection to the database is not yet 
established. The connection will be established when you call 
[db.connect()](#db_connect) or implicitly opened by calling 
[db.query()](#db_query).

You don't need to worry that every time you instantiate a DB or its 
subclasses like Query or Model, even subclasses of Model and so on, a new 
connection will be established, well, there will be not.

Also, DB class saves connections by there specifications, so you don't need to
worry that they will mess up in the connection pool.

### DB.init()

*Initiates configurations for every DB instance.*

**parameters:**

- `config` An object that carries configurations.

**return:**

Returns the class itself for function chaining.

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

The difference between the `db.constructor()` and `DB.init()` is that 
`db.constructor()` only sets the configuration for one instance, while 
`DB.init()` will initiate all instances.

### DB.on()

*Binds a listener to an event for all DB instances.*

**parameters:**

- `event` The event name.
- `callback` A function called when the event fires.

**return:**

Returns the class itself for function chaining.

```javascript
const { DB } = require("modelar");

DB.on("query", db => {
    // Make a log when a SQL statement is run.
    // `db.sql` is the SQL statement while `db.bindings` is an array of values
    // bound to it.
    console.log(db.sql, db.bindings);
});
```

### db.on()

*Binds a listener to an event.*

**parameters:**

- `event` The event name.
- `callback` A function called when the event fires.

**returns:**

Returns the current instance for function chaining.

This method inherits from [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html).

```javascript
const { DB } = require("modelar");

var db = new DB();
db.on("query", db=>{
    // Print out the SQL statement and its bindings.
    console.log(db.sql, db.bindings);
});
```

### db.once()

*Binds a listener to an event that will only run once.*

**parameters:**

- `event` The event name.
- `callback` A function called when the event fires.

**returns:**

Returns the current instance for function chaining.

This method inherits from [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html).

```javascript
const { DB } = require("modelar");

var db = new DB();
db.on("query", db=>{
    // Print out the SQL statement and its bindings.
    console.log(db.sql, db.bindings);
});
```

### db.trigger()

*Fires an event and triggers its listeners.*

**parameters:**

- `event` The event name.
- `...args`  Arguments passed to event listeners.

**return:**

Returns `true` if the event had listeners, `false` otherwise.

**alias:**

- `db.trigger()`

This method inherits from [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html).

### db.connect()

*Acquires a connection.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

**alias:**

- `db.acquire()`

```javascript
const DB = require("modelar/DB");

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

**parameters:**

- `db` A DB instance that is already created.

**return:**

Returns the current instance for function chaining.

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

**parameters:**

- `sql` The SQL statement.
- `[...bindings]` The data bound to the SQL statement.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

This method is a common API to execute SQL statements in a compatible way for
all database drivers that Modelar supports, so when you are calling this 
method, must use `?` as placeholder, and put values in the `bindings`.

```javascript
const { DB } = require("modelar");

var db = new DB();

//selects
db.query("select * from users where id = ?", 1).then(db=>{
    //db has a _data property that carries all the data that the sql 
    //fetches.
    console.log(db._data); //Print out all the data.
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

**A tip for `insertId` and `affectedRows`.**

The example given above shows you a little bit of these two properties, BUT, 
do not rely on them, because they act different with different database 
drivers. Like in PostgreSQL, `affectedRows` also contain values both in 
`insert` and `select` statements. As for `insertId`, since PostgreSQL dose not
return any IDs after inserting the record, Modelar provides a tricky way to 
get this property, but you should set a field named `id` for every table that 
you want the `insertId` to be available.

### db.transaction()

*Begins transaction and handle actions in it.*

**parameters:**

- `[callback]`  If a function is passed, the code in it will be automatically
    handled, that means if the program goes well, the transaction will be 
    automatically committed, otherwise it will be automatically rolled back. 
    If no function is passed, it just start the transaction, that means you 
    have to commit and roll back manually.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

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

*Commits the transaction.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

### db.rollback()

*Rollbacks the transaction.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

### db.quote()

*Adds quote marks to a specified value.*

**parameters:**

- `value` A value that needs to be quoted.

**return:**

The quoted value.

```javascript
const { DB } = require("modelar");

var db = new DB();
var value = "This's is a value that needs to be quoted.";
console.log(db.quote(value));
// 'This\'s is a value that needs to be quoted.'
```

### db.backquote()

*Adds back-quote marks to a specified identifier.*

**parameters:**

- `identifier` An identifier (a table name or a field name) that needs to be 
    quoted.

**return:**

The quoted identifier.

```javascript
const { DB } = require("modelar");

var db = new DB();
var name = "table_name";
console.log(db.quote(name));
// `table_name` in MySQL, "table_name" in PostgreSQL.
```

### db.close()

*Closes the the connection.*

This method returns void.

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

**alias:**

- `db.recycle()`

This method returns void.

```javascript
const { DB } = require("modelar");

var db = new DB();
db.query("select * from `users` where `id` = ?", [1]).then(db=>{
    console.log(db._data);
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

### DB.destroy()

*Closes all connections in all pools.*

**alias:**

- `DB.close()`

This method returns void.

### Pre-defined Events

At DB level, there is only one event `query`, every time calling 
[db.query()](#db_query) to run a SQL statement, this event will be fired and 
all the handlers bound to it will be triggered.

You can either use [DB.on()](#DB_on) or [db.on()](#db_on) to bind event 
listeners to this event, but be aware of the difference they act.

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
app.use((req, res, next)=>{
    // Make a connection to the database, store it in the req.db property.
    req.db = new DB();

    // Add an event handler that when the response has been sent, recycle the 
    // connection and wait for the next request to retrieve it.
    res.on("finish", () => {
        req.db.recycle();
    });

    next();
});

// Define a route to get a user by its UID.
app.get("/user/:id", (req, res)=>{
    // Use the existing conneciton.
    User.use(req.db).get(req.params.id).then(user=>{
        // If user exists and has been fetched, this code block will run.
        res.json({
            success: true,
            data: user.valueOf(),
        });
    }).catch(err=>{
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