
#### Table of Contents

* [The Table Class](#The-Table-Class)
    * [table.constructor()](#table_constructor)
    * [table.addColumn()](#table_addColumn)
    * [table.primary()](#table_primary)
    * [table.autoIncrement()](#table_autoIncrement)
    * [table.unique()](#table_unique)
    * [table.default()](#table_default)
    * [table.notNull()](#table_notNull)
    * [table.unsigned()](#table_unsigned)
    * [table.comment()](#table_comment)
    * [table.foreignKey()](#table_foreignKey)
    * [table.save()](#table_save)
    * [table.getDDL()](#table_getDDL)
    * [Table.drop()](#Table_drop)

## The Table Class

*Database Table Manager.*

This is a tool to generate DDL statements and create tables for Models, it 
provides some useful methods that let you create tables without too much 
effort.

### table.constructor()

*Creates a new instance with a specified table name.*

**parameters:**

- `table` The table name.

```javascript
const { Table } = require("modelar");

// Initiate a table instace with a given name.
var table = new Table("users");
```

## table.addColumn()

*Adds a column to the table.*

**parameters:**

- `name` The name of the field.
- `[type]` The type of the field, if the field is the primary key, then this 
    argument can be omitted.
- `[length]` The top limit of length that this field can store, also it could 
    be an array carries only two numbers that represents a range between 
    bottom and top.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

// primary() and autoIncrement() will be talked about later.
table.addColumn("id").primary().autoIncrement(); 
// Set the length to be an interval.
table.addColumn("name", "varchar", [3, 15]);
// Only set the maximum length for `email`.
table.addColumn("email", "varchar", 25);
// Add other columns like `password`.
table.addColumn("password", "varchar", 255);

// Save the table, this will actually create a new `users` table in database.
table.save();
```

The Table instance has an internal pointer that points to the current field, 
`addColumn()` will add a new column and move the pointer to it, so that other 
methods like `primary()`, `unique()`, etc., will work on the that field. 
There is not way to move the pointer back or to a particular column, so you 
must call other methods to do stuffs right after calling `addColumn()`.

### table.primary()

*Sets the current field to be the primary key of the table.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

// Call primary() right after adding a column.
table.addColum("id", "integer").primary();
```

### table.autoIncrement()

*Sets the current field to be auto-increment.*

**parameters:**

- `[start]` The initial value, default is `1`.
- `[step]` The step length, default is `1`. (Not every database supports the 
    `step`.)

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("id").primary().autoIncrement();
```

For consistency, only the primary key can be auto-increment within Modelar.

### table.unique()

*Sets the current field's value to be unique.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", [3, 15]).unique();
```

### table.default()

*Sets a default value for the current field.*

**parameters:**

- `value` The default value.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

// Set an empty string as default.
table.addColumn("name", "varchar", 25).default("");
```

### table.notNull()

*Sets the current filed to be not null.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", 25).default("").notNull();
```

### table.unsigned()

*Sets the current field to be unsigned.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("level", "integer").unsigned();
```

### table.comment()

*Adds a comment to the current field.*

**parameters:**

- `text` The comment text.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().comment("The primary key.");
```

### table.foreignKey()

*Sets a foreign key constraint for the current field.*

**parameters:**

- `table` A table where the the foreign key is in, it is also possible to pass
    this argument an object that sets all the information of the constraint.
- `[field]` A field in the foreign table that related to the current field.
- `[onDelete]` An action triggered when the record is deleted. optional values
    are:
    - `no action`
    - `set null` (by default)
    - `cascade`
    - `restrict`
- `[onUpdate]` An action triggered when the record is updated (not supported 
    by every database). optional values
    are: 
    - `no action` (by default)
    - `set null`
    - `cascade`
    - `restrict`

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("level_id", "integer")
     .foreignKey("level", "id", "no action", "no action");

// Or pass an object as the argument.
table.addColumn("level_id", "integer")
     .foreignKey({
         table: "level",
         field: "id",
         onUpdate: "no action",
         onDelete: "no action",
     });
```

### table.save()

*Saves the table, this method actually creates a new table in the database.*

**alias:**

- `table.create()`

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var table = new Table("users");

// Do stuffs here...

table.save().then(table=>{
    console.log(table.sql);
    // The sql property carries the sql statement that creates the table, 
    // A.K.A. DDL.
}).catch(err=>{
    console.log(err);
});
```

### table.getDDL()

*Gets the DDL statement by the definitions.*

**return:**

Returns the DDL statement.

This method is used to generate and get the DDL statement, but don't create 
the table. If you called [table.save()](#table_save) to create the table, the 
DDL will be automatically stored in the `table.sql` property.

### Table.drop()

*Drops the table from the database.*

**parameters:**

- `table` The table name you're going to drop.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a new table instance.

This method is equivalent to `new Table("table").drop()`.