# Modelar

An expressive Model with promise functionality and SQL constructor.

## Example

```javascript
const DB = require("modelar/supports/DB"); //Import DB support.
const Model = require("modelar"); //import base Model.
const User = require("modelar/User"); //Import User model.

DB.config({ //configure database
    database: 'test',
});

//Add a global event handler to every Models.
Model.on("save", model=>{
    console.log(model.toString())
});

var user = new User();
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345"; //`password` of User model will be aotumatically 
                         //encrypted by bcrypt.
console.log(user.valueOf()); //user.valueOf() represents the data that User 
                             //holds.
//It will print something like this:
//{ name: 'hyurl',
//  email: 'i@hyurl.com',
//  password: '$2a$10$lKCLB38dpeeAB0vHTQF9DeEAej3iIuGQ2SR6kl8hJVKI/bNtca8QW' }
user.save().then(user=>{
    console.log(user.name+' is saved with an id: '+user.id 
                +' and an email: '+user.email+'.');
}).catch(err=>{ //Catch the error if any presents.
    console.log(err);
});
```

Above gives a very simple example that shows the convenience and expressive 
functionality that this Model has, now we can go into the real depth of it.

## What can this module do?

* **Easy to use**
    * You can just define a class that extends the Model, and most of the 
    work would be done for you.
    * Promise guarantees that all the procedures is in control with one logic.
* **Expressive and good looking**
    * The attribute of a model is actually a property of the instance.
    * Whole setter and getter supports.
* **Powerful SQL constructors**
    * This module provides most of the SQL query supports to the Model.
    * Query class makes SQL Object-Oriented and more easier to generate SQL 
    statements.
* **Database connection controllable**
    * The DB class guarantees that there will be only one connection to the 
    same database and reused.
    * Transaction is very easy to use, the program will automatically commit 
    or rollback for you.

## Table of Contents
* [Install](#install)
* [The DB Class](#the-db-class)
    * [DB.constructor()](#dbconstructor)
    * [DB.config()](#dbconfig)
    * [DB.use()](#dbuse)
    * [DB#connect()](#dbconnect)
    * [DB#query()](#dbquery)
    * [DB#transaction()](#dbtransaction)
    * [DB#close() & DB.close()](#dbclose)
* [The Table Class](#the-table-class)
    * [Table.constructor()](#tableconstructor)
    * [Table#addColumn()](#tableaddcolumn)
    * [Table#primary()](#tableprimary)
    * [Table#autoIncrement()](#tableautoincrement)
    * [Table#unique()](#tableunique)
    * [Table#default()](#tabledefault)
    * [Table#notNull()](#tablenotnull)
    * [Table#unsigned()](#tableunsigned)
    * [Table#comment()](#tablecomment)
    * [Table#foreignKey()](#tableforeignkey)
    * [Table#save()](#tablesave)
* [The Query class](#the-query-class)
    * [Query#constructor()](#queryconstructor)
    * [Query#on()](#queryon)
    * [Query#trigger()](#querytrigger)
        * [Event Inheriting](#event-inheriting)
    * [Query#select()](#queryselect)
    * [Query#from()](#queryfrom)
    * [Query#where()](#querywhere)
    * [Query#orWhere()](#queryorwhere)
    * [Query#whereBetween()](#querywherebetween)
    * [Query#whereNotBetween()](#querywherenotbetween)
    * [Query#whereNotIn()](#querywherenotin)
    * [Query#whereExists()](#querywhereexists)
    * [Query#whereNotExists()](#querywherenotexists)
    * [Query#whereNull()](#querywherenull)
    * [Query#whereNotNull()](#querywherenotnull)
    * [Query#join()](#queryjoin)
    * [Query#rightJoin()](#queryrightjoin)
    * [Query#fullJoin()](#queryfulljoin)
    * [Query#crossJoin()](#querycrossjoin)
    * [Query#orderBy()](#queryorderby)
    * [Query#random()](#queryrandom)
    * [Query#groupBy()](#querygroupby)
    * [Query#having()](#queryhaving)
    * [Query#limit()](#querylimit)
    * [Query#distinct()](#querydistinct)
    * [Query#union()](#queryunion)
    * [Query#insert()](#queryinsert)
    * [Query#update()](#queryupdate)
    * [Query#delete()](#querydelete)
    * [Query#get()](#queryget)
    * [Query#all()](#queryall)
    * [Query#count()](#querycount)
    * [Query#paginate()](#querypaginate)
* [The Model Class](#the-model-class)
    * [Model.constructor()](#modelconstructor)
    * [User-defined Setters and Getters](#user-defined-setters-and-getters)
    * [Model#assign()](#modelassign)
    * [Model#on()](#modelon)
    * [Model#trigger()](#modeltrigger)
    * [Model#save()](#modelsave)
    * [Model#get()](#modelget)
    * [Model#all()](#modelall)
    * [Model#getMany()](#modelgetmany)
    * [Static Methods](#static-methods)

## Install

### Promised Model

```sh
$ npm install modelar
```

### Dependencies

Modelar requires some dependencies in you project, `MySQL` and `BCrypt` 
will be automatically installed for you when you install Modelar, but if 
you need `SQLite` support, you have to install it manually by doing this:

```sh
$ npm install sqlite3
```

MySQL and SQLite is the only databases that this module currently supports, 
You just need to install what you need, and leave others behind.

## The DB class

DB class is the super class of all classes of this module, Query extends it, 
and Model extends Query, which we will talk about later, now we just focus on 
the DB, see what abilities it brings to us.

### DB.constructor()

**parameters:**

- `[config]` An object that sets the configuration for the current 
    instance, or a string that sets only the database name.

```javascript
var db = new DB({
    database: 'test',
});
//Also, it is possible to pass a String argument to the constructor, 
//it will be treated as the database name for configuration, like this:
var db = new DB("test"); //Is the same as above.
```

You don't need to worry that every time you instantiate a DB or its 
subclasses like Query or Model, even subclasses of Model and so on, a new 
connection will be established, well, there will be not.

DB class will store the connection the first time you create it, and the next 
time you create a new instance with the same database configuration, instead 
of creating a new connection, the old one will be used. This will guarantee 
that there will be only one connection to the same database in the whole 
program.

Of cause if you connect to a different database, a new connection will be 
expectedly established.

### DB.config()

**Sets global DB configurations for every DB instance.**

**parameters:**

- `config` An object that sets the global configuration for every DB instance.

**return:**

Returns DB class itself for function chaining.

```javascript
const DB = require('modelar/supports/DB'); //Import DB class.

DB.config({
    type: 'mysql', //Support mysql and sqlite.
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: '',
    database: 'test', //Set the database name.
});
```

The all supported configurations are showing bellow:

- `type` Sets the database type that this program use (default: `mysql`);
- `host` Sets the serve name of the database (only for MySQL, default: 
    `localhost`);
- `port` Sets the port that host use (only for MySQL, default `3306`);
- `user` Sets the username that used for logging in to the database (only for 
    MySQL, default: `root`);
- `password` Sets the password for user (only for MySQL);
- `database` Sets the database name that need to open;
- `charset` Sets the charset (only for MySQL, default: `utf8`);
- `timeout` Sets both the connection timeout and query timeout(only for MySQL, 
    default is `5000` misc.);
- `autoConnect` Automatically opens the connection when the DB is 
    instantiated, default is `false`.

The difference between the `constructor()` and `config()` method is that 
`constructor()` only sets the configuration for one instance, while 
`config()` will initiate all.

### DB.use()

**Uses a connection that is already created.**

**parameters:**

- `connection` An existing connection that is created by DB or MySQL, or MySQL 
    pool, or SQLite.

**return:**

Returns DB itself for function chaining.

```javascript
const DB = reuiqre('modelar/supports/DB');
const mysql = require('mysql'); //Import MySQL

//Create a MySQL connection pool.
const pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'test'
});
pool.getConnection((err, connection) =>{
    //Since there is a connection already exist, we can just use it instead.
    DB.use(connection);
    //Do other stuffs here, the connection is established now.
    //Even instantiate a new instance, the connection will be used in that 
    //instance as well.
});
```

### DB#connect()

**Opens the connection to the database.**

**return:**

Returns the current instance for function chaining.

```javascript
var db = new DB("test");
db.connect();
```

Generally, you don't need to open connections manually, when `DB.query()` 
(which will be discuss next) is called, the connection will be established 
automatically.

### DB#query()

**Runs a SQL statement.**

**parameters:**
- `sql` The SQL statement prepared to execute.
- `[binding]` The data binds to the SQL.

**return:**

Returns a **Promise** while running the `sql` asynchronously, so that we can 
use its functionality, the `then()` and the `catch()` to handle the program. 
The only argument passes to the callback function of `then()` is the current 
instance.

```javascript
var db = new DB('test');
//selects
db.query("select * from users where id = ?", [1]).then(db=>{
    //db has a __data property that stores all the data that the sql 
    //fetches.
    console.log(db.__data); //Print out all the data.
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
db.query("delete from users where `id` = ?", [1]).then(db=>{
    //`affectedRows` also works in deletes.
    console.log(db.affectedRows + " rows were deleted.");
}).catch(err=>{
    console.log(err);
});
```

### DB#run()

**This is an alias of `DB.query()`.**

### DB#transaction()

**Starts a transaction and handle it.**

**parameters:**

- `[callback]` If a callback function is passed, the codes in it 
    will be automatically handled by transaction.

**return:**

This method simply calls `query()` to run `begin` to start a transaction, so 
it returns the same Promise as `query()` does.

```javascript
var db = new DB("test");
db.transaction(db=>{
    //Do stuffs here, if something didn't go well, you just need to 
    //throw new Error("message"), 
    //and the catch() will be called,
    //otherwise then() will be called.
}).then(db=>{
    //Do stuffs here if the program goes well, 
    //the transaction will be automaticallly committed.
}).catch(err=>{
    //Do stuffs here if the program goes wrong, 
    //the transaction will be automaticallly rollbacked.
});

//Also, you can choose not to pass the callback function, just only start
//the transaction, and call commit() to commit and rollback() to rollback 
//manually, like this:
db.transaction();
//Do stuffs here...
if(true){
    db.commit(); //Commit manually.
}else{
    db.rollback(); //Rollback manually.
}
```

### DB#commit()

**Commits the transaction.**

**return:**

This method is just calling `return db.query('commit')`, so it returns the 
same Promise as `query()` does.

### DB#rollback()

**Rollbacks the transaction.**

**return:**

This method is just calling `return db.query('rollback')`, so it returns the 
same Promise as `query()` does.

### DB#close()

**Closes the the connection of the current instance.**

**return:**

Returns the current instance for function chaining.

```javascript
var db = new DB("test");
db.query("select * from users where 1").then(db => {
    //Do stuffs here.
    //If there is nothing more to do, you must close the connection, or the 
    //Nodejs will loop untill the server closes the connection.
    db.close();
})
```

### DB.close()

**Closes all the connections that DB holds.**

**return:**

Returns the DB class itself for function chaining.

The difference between instantiated version of `close()` and static version 
of `close()` is that the former closes only the current instance connection, 
and the later closes all the connections that DB holds, so that you don't 
need to close every connection one at a time, just call `DB.close()` at the 
very end of the program, and that will be fine.


## The Table Class

`Table` is a tool to generate DDL and create table for Models, it provides 
some useful methods that let you create a table without too much effort.

### Table.constructor()

**parameters:**

- `table` Sets the table name that you want to create.

```javascript
const Table = require("modelar/supports/Table"); //Import the Table.

//Initiate a table instace with a given name.
var table = new Table("users");
```

## Table#addColumn()

**Adds a column to the table.**

**parameters:**

- `name` The field name of the column.
- `type` Sets the type of the column.
- `[length]` The length of data that this column can store with, 
    it could be a number that sets the maximum length or an array that sets 
    the range between minimum and maximum lengths.

**return:**
Returns the current instance for function chaining.

```javascript
var table = new Table("users");

//We will talk about primary() and autoIncrement() later.
table.addColumn('id', 'interger').primary().autoIncrement(); 
//Set the length to be an interval.
table.addColumn('name', 'varchar', [3, 15]);
//Only set the maximum length for `email`.
table.addColumn('email', 'varchar', 25);
//Add other columns like `password`.
table.addColumn('password', 'varchar', 255);

//Save the table, this will actually create a new `users` table in database.
table.save();
```

The Table instance has an internal pointer that points to the current field, 
`addColumn()` will add a new column and move the pointer to it, so that other 
methods like `primary()`, `unique()`, etc., will work on the that field. 
There is not way to move the pointer back or to a particular column, so you 
must call other methods to do stuffs right after calling `addColumn()`.

### Table#primary()

**Sets the current field to be a primary key.**

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

//Call primary() right after adding a column.
table.addColum('id', 'integer').primary();
```

### Table#autoIncrement()

**Sets the column to be auto increment.**

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().autoIncrement();
```

### Table#unique()

**Sets the column to be unique.**

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn('name', 'varchar', [3, 15]).unique();
```

### Table#default()

**Sets a default value for the column.**

**parameters:**

- `value` The default value.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

//Set an empty string as default.
table.addColumn("name", "varchar", 25).default("");
```

### Table#notNull()

**Sets the column to be not null.**

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", 25).default("").notNull();
```

### Table#unsigned()

**Sets the column to be unsigned.**

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("level", "integer").unsigned();
```

### Table#comment()

**Defines a comment or description for the column.**

**parameters:**

- `text` The comment text.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().comment("The primary key.");
```

### Table#foreignKey()

**parameters:**

- `table` The foreign table you want to concatenate, also this can be passed 
    as an Object that sets all the arguments bellow, includes `table`.
- `[field]` The foreign key on the foreign table.
- `[onUpdate]` The action will be triggered when the record is update, it 
    could be `no action` (default), `set null`, `cascade`, `restrict`.
- `[onDelete]` The action will be triggered when the record is delete, it 
    could be `no action` (default), `set null`, `cascade`, `restrict`.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("level_id", "integer")
     .foreignKey("level", "id", 'no action', 'no action');

//Or pass an Object as the argument.
table.addColumn("level_id", "integer")
     .foreignKey({
         table: 'level',
         field: 'id',
         onUpdate: 'no action',
         onDelete: 'no action',
     });
```

### Table#save()

**return:**

Returns a Promise, and the only argument passes to the `then()`'s callback is 
the current instance.

```javascript
var table = new Table("users");
//Do stuffs here.
table.save().then(table=>{
    console.log(table.ddl);
    //The ddl property carries the sql statement that creates the table， 
    //which is the same as the sql property.
}).catch(err=>{
    console.log(err);
});
```

## The Query class

`Query` is a constructor that generates SQL statements for queries, use some 
of its methods, which provide Object-Oriented features to generate SQLs in a 
more easier way.

### Query#constructor()

**parameters:**

- `[table]` The table name that the Query instance binds to.

```javascript
const DB = require("modelar/supports/DB"); //import DB
const Query = require("modelar/supports/Query"); //import Query

DB.config({ //Configure database.
    database: 'test',
});

//Instanciate a new query with the given table.
var query = new Query("users");
```

### Query#on()

**Binds an event handler to a query instance.**

- `event` The name of event.
- `callback` The function will be triggered when the event fires, it accepts 
    an argument which is the current instance. 

**return:**

Returns the current instance for function chaining.

```javascript
const Query = require('modelar/supports/Query');

var query = new Query("users");
query.on('insert', query=>{
    //Do stuffs here...
});

//Alternatively, there is a static method Query.on(), which allows you to 
//bind event handlers to all the queries.

Query.on('insert', query=>{
    //Do stuffs here...
});
```

The following lists all the events that are pre-defined:

- `insert` This event will be fired when data are about to be inserted.
- `inserted` This event will be fired when data are inserted successfully.
- `update` This event will be fired when data are about to be updated.
- `updated` This event will be fired when data are updated successfully.
- `delete` This event will be fired when data are about to be deleted.
- `deleted` This event will be fired when data are deleted successfully.
- `get` This event will be fired when data are fetched from the database.

### Query#trigger()

**Trigger an event handler to execute in a particular scenario.**

**parameters:**

- `event` The name of event.
- `data` The only argument passes to the event handler.

**return:**

Returns the current instance for function chaining.

Generally, this method should be called inside a query method, which is the 
pre-defined events do. Here is an example of how:

```javascript
const Model = require("modelar"); //Since Model extends Query

class Post extends Model{
    //Do other stuffs...
    
    //Define a like method for Post class.
    like(){
        //Do stuffs here...
        this.trigger('like', this); //Trigger the event handler of like.
        //Do other stuffs here...
    }
}
```

#### Event Inheriting

You may have already figured out what this feature is and what it's for, 
when you set an event handler to the Query class by using the static method 
`Query.on()`, this handler will be inherited by all its instances and its 
subclasses, and subclasses' instances. This is a good feature, but make 
sure to use it right. Event handlers will be inherited by subclasses, but 
will not affect sibling classes, and that prevent them apart from each 
other.

### Query#select()

**parameters:**

- `...fields` Decides which fields that will be fetched when a select query 
    runs, you can pass several arguments to this method, they will be treated 
    as an array that carries multiple fields, or just pass one array to this 
    method, which is the same.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select("id", "name", "email");
//Or just pass an array as its first argument.
query.select(["id", "name", "email"]);
```

### Query#from()

**Sets the table name where the record will be selected from.**

**parameters:**

- `table` The table name that binds to the query.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query(); //If you don't pass a table name here,

query.select("id", "name", "email").form("users"); //you can binids it here.
```

### Query#table()

**This is an alias of `Query#from()`, but is more convenient when doing other 
stuffs other than selects.**

### Query#where()

**Sets the where clause of the SQL statement.**

**parameters:**

- `field` Can be an field name, or an Object that sets multiple conditions at 
    one time, or pass a callback function to set a nested where clause for 
    the SQL statement. The callback function requires an argument, which will 
    be a new query instance.
- `[operator]` The operator that used to define condition, if `value` is 
    not passed, this argument will replace the `value`, and the operator 
    will be `=`.
- `[value]` The value that this where clause needs to check.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.where("id", "=", 1);
//Equals to
query.where("id", 1);
//Or use other operators.
query.where("name", "<>", "ayon");
//Even like
query.where("name", "like", "%hyurl%");
//Or pass a callback for nested clause.
query.where("id", 1).where(_query=>{
    //This is a new query instance.
    _query.where("name", "hyurl");
});
//Will generate like this: where `id` = ? and (`name` = ?)
//with bindings [1, 'hyurl']
```

### Query#orWhere()

**Sets the or where clause of the SQL statement.**
This is similar to `Query#where()` with `or`.

### Query#whereBetween()

**Sets the between clause of the SQL statement.**

**parameters:**

- `field` The field name.
- `range` Sets a range between start and end.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereBetween("id", [1, 10]); //where `id` between 1 and 10
```

### Query#whereNotBetween()

**Sets the not between clause of the SQL statement.**
This is similar to `Query#whereBetween()` with `not`.

### Query#whereIn()

**Sets the in clause of the SQL statement.**

**parameters:**

- `field` The field name.
- `range` Sets all the possible values in an array.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereIn("id", [1, 2, 3, 4]); //where `id` in (1, 2, 3, 4)
```

### Query#whereNotIn()

**Sets the not in clause of the SQL statement.**
This is similar to `Query#whereIn()` with `not`.

### Query#whereExists()

**Sets the exists clause of the SQL statement.**

**parameters:**

- `callback` This callback will generate a nested clause in a exists clause, 
    it accepts one argument, which is a new query instance.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereExists(_query=>{
    //This is a new query instance.
    _query.select('*').from("users").where("id", 1);
}); //where exists (select * from `users` where `id` = 1)
```

### Query#whereNotExists()

**Sets the not in clause of the SQL statement.**
This is similar to `Query#whereExists()` with `not`.

### Query#whereNull()

**Sets the null clause of the SQL statement.**

**parameters:**

- `field` The field name that needs to check.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereNull("email"); //where `email` is null
```

### Query#whereNotNull()

**Sets the not null clause of the SQL statement.**
This is similar to `Query#whereNull()` with `not`.

### Query#join()

**Sets the inner join clause of the SQL statement.**

**parameters:**

- `table` The table name you want to join with.
- `field1` The field in the main table that needs to check.
- `operator` The operator that used to define condition, if `field2` is not 
    passed, this argument will replace the `field2`, and the operator will be 
    `=`.
- `[field2]` The field in the `table` that needs to check.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.join('roles', 'user.id', '=', 'role.user_id');
//Or pass a Object
query.join('roles', {"user.id": "role.user_id"});
//select * from `users` inner join `roles` on user.id = role.user_id

//Or pass a callback function
query.join('role', _query=>{
    _query.on('user.id', 'role.user_id');
});
//select * from `users` inner join `roles` on (user.id = role.user_id)
```

### Query#leftJoin()

**Sets the the left join clause of the SQL statement.**
This is similar to `Query#join()` with `left join`.

### Query#rightJoin()

**Sets the the right join clause of the SQL statement.**
This is similar to `Query#join()` with `right join`.

### Query#fullJoin()

**Sets the the full join clause of the SQL statement.**
This is similar to `Query#join()` with `full join`.

### Query#crossJoin()

**Sets the the cross join clause of the SQL statement.**
This is similar to `Query#join()` with `cross join`.

### Query#orderBy()

**Sets the order by condition of the SQL statement.**

**parameters:**

- `field` The field name that `order by` based on.
- `[sequence]` Sets the sequence, it could be `asc` or `desc`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.orderBy("id", "desc");
//You can set multiple order-bys as well.
query.orderBy("name"); //sequence is optional.
//This will be: select * from `users` order by `id` desc, `name`
```

### Query#random()

**Sets the sequence to be random when select.**

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.random();
//In MySQL: select * from `users` order by rand()
//In SQLite: select * from `users` order by random()
```

### Query#groupBy()

**Sets the group by condition of the SQL statement.**

**parameters:**

- `...field` The fields list, pass each field as an argument, or just pass 
    the first argument as an array to set multiple fields.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.groupBy("name"); //Pass one field.
query.groupBy("name", "email"); //Pass two fields.
query.groupBy(["name", "email"]); //Pass an array.
```

### Query#having()

**Sets the having clause of the SQL statement.**

**return:**

- `raw` An raw SQL condition statement.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select("name", "sum(money)")
     .where("name", "hyurl")
     .groupBy("name")
     .having("sum(money) > 200");
//select `name`, sum(money) from `users` where `name` = 'hyurl' group by 
//`name` baving(money) > 20
```

### Query#limit()

**Sets the limit condition of the SQL statement.**

**parameters:**

- `offset` The start point of records, begins from 0. If `length` is not set, 
    this argument will replace `length` and `offset` will be `0`.
- `[length]` How many counts of records that the query will fetch, default is 
    `0`, which means no limit at all. 

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.limit(0, 10); //select * from `users` limit 0, 10
//Or
query.limit(10); //select * from `users` limit 10
```

### Query#distinct()

**Sets the distinct condition of the SQL statement.**

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select('name').distinct(); //select distinct `name` from `users`
```

### Query#union()

**Unites two SQL statements to be one query.**

**parameters:**

- `query` A SQL statement or a Query instance.
- `[all]` Sets an `union all` clause, default is `false`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.union("select * from `roles`");
//Or pass another Query instance.
var query2 = new Query("roles");
query.union(query2);
//Union all:
query.union(query2, true);
```

### Query#insert()

**Inserts a new record into the database.**

**parameters:**

- `data` An Object that represents fields and their values, also it is 
    possible to pass an Array that carries all fields' values.

**return:**

Returns a promise, and the only argument pass to the callback is the current 
instance.

```javascript
var query = new Query("users");

query.insert({
    name: 'hyurl',
    email: "i@hyurl.com",
}).then(query=>{
    console.log("A new user has been inserted.");
}).catch(err=>{
    console.log(err);
});

//Also possible to pass an array, but you have to pass the values of all the 
//fields.
query.insert([
    1, //id
    "hyurl", //name
    "i@hyurl.com", //email
    "123456", //password
]).then(query=>{
    console.log("A new user has been inserted.");
}).catch(err=>{
    console.log(err);
});
```

### Query#update()

**Updates a record in the database.**

**parameters:**

- `data` An object that represents fields and their values.

**return:**

Returns a promise, and the only argument pass to the callback is the current 
instance.

```javascript
var query = new Query("users");

query.where("id", 1).update({
    name: "hyurl",
    email: "i@hyurl.com",
}).then(query=>{
    console.log("The user has been updated.");
}).catch(err=>{
    console.log(err);
});
```

### Query#delete()

**Deletes a record from the database.**

**return:**

Returns a promise, and the only argument pass to the callback is the current 
instance.

```javascript
var query = new Query("users");

query.where("id", 1).delete().then(query=>{
    console.log("The user has been deleted.");
}).catch(err=>{
    console.log(err);
})
```

### Query#get()

**Gets a record form the database that suits the given conditions.**

**return:**

Returns a promise, and the only argument pass to the callback is the fetched 
data.

```javascript
var query = new Query("user");

query.where("id", 1).get().then(data=>{
    console.log(data); //The data will be an object that carries one record.
}).catch(err=>{
    console.log(err);
});
```

### Query#all()

**Gets all the records from the database that suit the given conditions.**

**return:**

Returns a promise, and the only argument pass to the callback is the fetched 
data in an array.

```javascript
var query = new Query("user");

query.all().then(data=>{
    console.log(data); //The data will be an array that carries all records.
}).catch(err=>{
    console.log(err);
});
```

### Query#count()

**Gets the how many counts that suit suit the given conditions.**

**return:**

Returns a promise, and the only argument pass to the callback is the count 
number.

```javascript
var query = new Query("user");

query.count().then(count=>{
    console.log("There are "+count+" records in the table.");
}).catch(err=>{
    console.log(err);
});
```

### Query#paginate()

**Gets the page information of all records that suit the given conditions.**

**parameters:**

- `[page]` The current page, default is `1`.
- `[limit]` The limit of per page, default is `10`.

**return:**

Returns a Promise, the only argument passes to the callback is an Object that 
carries the information, it includes `page` and `limit`, and `pages` 
represents all pages, `total` represents all counts of data, and `data` that 
carries all the fetched data.

```javascript
var query = Query("users");

query.where("id", ">", 0).paginate(1, 15).then(info=>{
    console.log(info);
    //It will be like this:
    //{
    //    page: 1,
    //    limit: 15,
    //    pages: 2,
    //    total: 24,
    //    data: [...]
    //}
}).catch(err=>{
    console.log(err);
});
```

## The Model Class

Now we go to the most important part of this module, the Model, this Model 
gives you the ability to handle data in a very easy way. It extends from 
`Query`, so has almost all the features that Query has, and other 
functionalities that make data operation more easier.

Since this class is the super class of all models, and every subclass must 
extends it, so that they could inherit its functionalities, and instantiate 
Model itself is not necessary, so I will just show you the example of how 
to create a new subclass, and how to use it, I will use the default 
subclass `User` as an example.

### Model.constructor()

**parameters:**

- `[data]` The initial data that put to the model.
- `[config]` Some configurations of the model, it can be some of these 
    information carried in an object:
    - `table` The database table that this model binds to.
    - `primary` The primary key of this model.
    - `fields` The table fields that this model has.
    - `searchable` The fields used for vague searching in this model.

Since you never need to instantiate a new Model itself, here I just show you 
how to call the `super()` function in a subclass. There is what `User` class 
does in its definition, and that is what you will do to define you own model 
class.

```javascript
const Model = require("./Model");

class User extends Model{
    constructor(data = {}, config = {}){
        super(data, Object.assign({ //You have to call `super()` to initiate.
            table: 'users', //Bind the table to `users`.
            primary: 'id', //Must set a primary key,
            field: [ //Put every field in here.
                'id',
                'name',
                'email',
                'password',
            ],
            searchable: [ //Put searchable fields in here.
                'name',
                'email',
            ]
        }, config));
    }

    //Other stuffs...
}
```

Maybe you have noticed that I give a `config` in User's constructor, the only 
reason I do this is because the User could be inherited, if your classes 
don't have such needs, you don't have to pass a `config` for them.

The Model will automatically set setters and getters for the `fields`, so you 
can directly access them as they are pseudo-properties of the model, check 
this out:

```javascript
const User = require("modelar/User");

var user = new User(); //This will actually create a new user.

//Use setter to set values for user's pseudo-properties.
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";
//It isn't possible you can set the primary key in this way, this code will 
//not work:
user.id = 1; //X wrong

//User getter to access pseudo-properties.
console.log(user.name); //hyurl
console.log(user.email); //i@hyurl.com
console.log(user.password); //Will print null, I'll explain this later.
```

There are also some useful features that makes more easier to get a model's 
information, let's just carry on:

```javascript
//Use the method toString() to get a jsonized data of the model.
console.log(user.toString()); //Will print a JSON.

//Or use the mothd valueOf() to get the data that the model represents.
console.log(user.valueOf()); //Will print an Object.

//The Model implements the Interator interface, so it is possible to travel 
//it in a for...of loop.
for(var [key, value] of user){
    console.log("The value of field `"+key+"` is "+value+".");
}
```

### User-defined Setters and Getters

The Model will automatically define setters and getters for every field, 
but only if there isn't one yet. So it's possible to define them for some 
particular fields manually, there is what the `User` does:

```javascript
class User extends  Model{
    //Other stuffs...

    //The setter of password, use BCrypt to encrypt data.
    set passwrod(v){
        var bcrypt = require('bcrypt-nodejs');
        //Model's data are stored in the __data property.
        this.__data.password = bcrypt.hashSync(v);
    }

    //The getter of password, always return undefined.
    //When a getter returns undefined, that means when you call toString() or
    //valueOf(), or in a for...of loop, this property will be absent.
    get password(){
        return undefined;
    }
}
```

Since JavaScript doesn't have private or protected properties, so it is 
possible to access all the information that an object carries, no matter what.

### Model#assign()

**Assigns data to the model.**

**parameters:**

- `data` The data that needs to assigned.
- `[useSetter]` Use setter (if any) to process the data, default is `false`.

**return:**

Returns the current instance for function chaining.

```javascript
//Generally, there are there ways to put data in a model.
//First, pass the data when instantiate:
var user = new User({
    name: 'hyurl',
    email: 'i@hyurl.com',
    password: '12345',
});

//Second, through pseudo-properties:
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";

//Third, call assign():
user.assign({
    name: 'hyurl',
    email: 'i@hyurl.com',
    password: '12345',
});

//The former two will automatically trigger user-defined setters, while the 
//third one will not, if you want it to, you must pass the second argument a 
//`true` to assign(), like this:
user.assign({
    name: 'hyurl',
    email: 'i@hyurl.com',
    password: '12345',
}, true);

//Another difference is that the former tow cannot set data of the primary 
//key, while assign() can. But this is only helpful when you get those data 
//from the database and want to put them in the model, which is the Model 
//internally does, otherwise it just make problems.

user.assign({
    id: 1,
    name: 'hyurl',
    email: 'i@hyurl.com',
    password: '12345',
});
```

### Model#save()

**Save the current model, if there is no record, insert a new one.**

**return:**

Returns a promise, and the only argument pass to the callback is the current 
instance.

```javascript
const User = new User();

user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";
user.save().then(user=>{
    console.log("The user is saved.");
}).catch(err=>{
    console.log(err);
});
```

### Model#get()

**Gets the data from the database that suits the given conditions.**

**return:**

Returns a promise, and the only argument passes to the callback is the 
current instance.

### Model#all()

**Gets all the data from the database that suit the given conditions.**

**return:**

Returns a promise, and the only argument passes to the callback is all the 
model instances in an array.

### Model#getMany()

**Gets all the data from the database that suit the given conditions.** 
Unlike `Model#all()`, this method accepts extra information that makes it 
easier to fetch data, and it also returns more information.

**parameters:**

- `[args]` An object that carries information for searching data. They can be 
    one or several table fields, and one or several key-value pairs of these:
    - `page` The current page, default is `1`.
    - `limit` The top limit of per page, default is `10`.
    - `orderBy` Ordered by a particular field, default is the primary key.
    - `sequence` The sequence of how the data are ordered, it could be `asc`, 
    `desc` or `rand`, default is `asc`.
    - `keywords` Keywords for vague searching, could be a string or an Array.

**return:**

Returns a promise, and the only argument passes to the callback of `then()` is
an Object that carries some information of these:

- `page` The current page.
- `limit` The top limit of per page.
- `orderBy` Ordered by a particular field.
- `sequence` The sequence of how the data are ordered.
- `keywords` Keywords for vague searching.
- `pages` A number of all model pages.
- `total` A number of all model counts.
- `data` An Array that carries all fetched models.

```javascript
const User = require("modelar/User");

var user = new User();
user.getMany({
    limit: 15, //Set the limit.
    sequence: 'rand', //Set sequence to be random.
    name: 'hyurl', //Pass a particular field and value.
    id: '<10', //Pass a value with an operator.
}).then(info=>{
    console.log(info); //Print out all the information.
}).catch(err=>{
    console.log(err);
});
```

### Static Methods

Most of the times, you don't want to create a new instance just for getting 
data from the database. So there is an alternative scheme, use static methods 
instead. The Model class provides almost all the methods inherited from Query 
to be static, some of them are just simple as making a instance and calling 
the method, some of them provides more features to make programing more 
efficient. I will make a list to show you the almost-same methods, and give 
details about more-feature methods.

**These methods are just the same as their instantiated versions:** They 
all return a model instance which is auto-instantiated.

- `Model.select()`
- `Model.join()`
- `Model.leftJoin()`
- `Model.rightJoin()`
- `Model.fullJoin()`
- `Model.crossJoin()`
- `Model.where()`
- `Model.whereBetween()`
- `Model.whereNotBetween()`
- `Model.whereIn()`
- `Model.whereNotIn()`
- `Model.whereNotIn()`
- `Model.whereNull()`
- `Model.whereNotNull()`
- `Model.orderBy()`
- `Model.random()`
- `Model.groupBy()`
- `Model.having()`
- `Model.limit()`
- `Model.all()`
- `Model.count()`
- `Model.paginate()`
- `Model.getMany()`
- `Model.insert()`

```javascript
const User = require("modelar/User");

//Now just call static methods when you need to get data.
User.select("name", "email").where("id", 1).get().then(user=>{
    //Do stuffs here...
});

//Get users in random order.
User.random().all().then(users=>{
    //Do stuffs here...
});

//Or in this way:
User.getMany({sequence: "rand"}).then(result=>{
    //Do stuffs here.
});
```

**These methods are improved to be more efficient.** They take more 
information than their instantiate versions do.

- `Model.update()` The only argument passes to it must carry the primary key.
- `Model.delete()` The only argument passes to it must carry the primary key, 
    or just pass a number, it will be treated as the primary key.
- `Model.get()` The only argument passes to it can carry any fields of the 
    model, or just pass a number, it will be treated as the primary key.

```javascript
const User = require("modelar/User");

//Update the user whose `id` is 1, set its name to a new one.
User.update({
    id: 1, //Must pass the primary key.
    name: "ayon", //rename the user
}).then(user=>{
    //Do stuffs here...
}).catch(err=>{
    console.log(err);
});

//Delete the user whose `id` is 1.
User.delete({id: 1}).then(user=>{
    //Do stuffs here...
});
//Or pass a number as the primary key.
User.delete(1).then(user=>{
    //Do stuffs here...
});

//Get a user by a specified argument.
User.get({
    name: 'hyurl',
}).then(user=>{
    //Do stuffs here...
});

//Or by the primary key
User.get(1).then(user=>{
    //Do stuffs here...
})
```