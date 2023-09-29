
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
    * [table.drop()](#table_drop)
    * [Table.drop()](#Table_drop)

## The Table Class

*Table Creator.*

This is a tool to generate DDL statements and create tables for Models, it 
provides some useful methods that let you create tables without too much 
effort.

### table.constructor()

*Creates a new instance with a specified table name.*

**signatures:**

- `new Table(name: string, schema?: { [field: string]: FieldConfig; })`
- `new Table(model: Model)`

```javascript
const { Table } = require("modelar");

var table = new Table("users");

// With schema:
var table = new Table("users", {
    id: {
        name: "id",
        type: "int",
        length: 10
        // ...
    }
    // ...
});
```

If you're using TypeScript, and defining model classes with decorators, you 
can pass the constructor a model instance.

```typescript
import { Table, User } from "modelar"; // User class is written in TpeScript.

var table = new Table(new User);
// Or:
var table = new Table("users", User.prototype.schema);
// Fields defined with decrators are stored in `Model.prototype.shcema`.
```

## table.addColumn()

*Adds a column to the table.*

**signatures:**

- `addColumn(name: string): this`
- `addColumn(name: string, type: string): this`
- `addColumn(name: string, type: string, length: number | [number, number]): this`
- `addColumn(field: FieldConfig): this`

`FieldConfig` includes:

- `name: string`
- `type?: string`
- `length?: number | [number, number]`
- `primary?: boolean`
- `autoIncrement?: boolean | [number, number]`
- `unique?: boolean`
- `default?: any`
- `unsigned?: boolean`
- `comment?: string`
- `notNull?: boolean`
- `foreignKey?: ForeignKeyConfig`

`ForeignKeyConfig` includes:

- `table: string` The name of the foreign table.
- `field: string`
- `onDelete?: "no action" | "set null" | "cascade" | "restrict"` An action 
    will be triggered when the record is deleted, default is `set null`.
- `onUpdate?: "no action" | "set null" | "cascade" | "restrict"` An action 
    will be triggered when the record is update, default is `no action`.

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

**signatures:**

- `primary(): this`

```javascript
var table = new Table("users");

// Call primary() right after adding a column.
table.addColum("id", "integer").primary();
```

### table.autoIncrement()

*Sets the current field to be auto-increment.*

**signatures:**

- `autoIncrement(): this`
- `autoIncrement(start: number, step?: number): this`

**Notice: not all databases support `step`.**

```javascript
var table = new Table("users");

table.addColumn("id").primary().autoIncrement();
```

For consistency, only the primary key should be auto-increment within Modelar.

### table.unique()

*Sets the current field's value to be unique.*

**signatures:**

- `unique(): this`

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", [3, 15]).unique();
```

### table.default()

*Sets a default value for the current field.*

**signatures:**

- `default(value: any): this`

```javascript
var table = new Table("users");

// Set an empty string as default.
table.addColumn("name", "varchar", 25).default("");
```

### table.notNull()

*Sets the current filed to be not null.*

**signatures:**

- `notNull(): this`

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", 25).default("").notNull();
```

### table.unsigned()

*Sets the current field to be unsigned.*

**signatures:**

- `unsigned(): this`

```javascript
var table = new Table("users");

table.addColumn("level", "integer").unsigned();
```

### table.comment()

*Adds a comment to the current field.*

**signatures:**

- `comment(text: string): this`

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().comment("The primary key.");
```

### table.foreignKey()

*Sets a foreign key constraint for the current field.*

**signatures:**

- `foreignKey(config: ForeignKeyConfig): this`
- `foreignKey(table: string, field: string, onDelete?: string, onUpdate?: string): this`

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

**signatures:**

- `save(): Promise<this>`

**alias:**

- `table.create()`

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

**signatures:**

- `getDDL(): string`

This method is used to generate and get the DDL statement, but don't create 
the table. If you called [table.save()](#table_save) to create the table, the 
DDL will be automatically stored in the `table.sql` property.

### table.drop()

*Drops the table from the database.*

**signatures:**

- `drop(): Promise<this>`

### Table.drop()

*Drops a table from the database.*

**signatures:**

- `drop(table: string): Promise<Table>`

This method is equivalent to `new Table("table").drop()`.