
#### 内容列表

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

## Table 类

*数据表建构器*

这是一个用于产生 DDL 语句并为模型创建数据表的工具，它提供了一些很有用的方法，使你能够
花很少力气就能够创建数据表。

### table.constructor()

*使用一个特定的表名来创建数据表实例。*

**parameters:**

- `table` The table name.

```javascript
const { Table } = require("modelar");

// 使用一个给定的表名创建实例
var table = new Table("users");
```

## table.addColumn()

*向表中添加一个新列。*

**参数：**

- `name` 字段名。
- `[type]` 字段类型，如果这是一个主键字段，那么这个参数是可以忽略的。
- `[length]` 这个字段可以存储的数据长度的上限，同时你也可以设置为一个数组，并包含
    两个元素，分别设置最短和最长限制。

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

// primary() 和 autoIncrement() 将会在后面讲到。
table.addColumn("id").primary().autoIncrement(); 
// 设置长度为一个区间。
table.addColumn("name", "varchar", [3, 15]);
// 只为 `email` 设置最大长度。
table.addColumn("email", "varchar", 25);
// 添加另外一个字段，如 `password`。
table.addColumn("password", "varchar", 255);

// 保存数据表，这个操作真的会在数据库里创建一个新的 名为 `user` 的表。
table.save();
```

数据表实例拥有一个内部指针，它指向当前字段，`addColoumn()` 会创建一个新的字段并将
指针移动到它上面，于是其它方法如 `primary()`、`unique()` 等，可以在这个字段上工作。
你无法将指针往后移动，或者移动到到一个指定的字段上，因此必须在调用 `addColumn()` 
之后，就调用其它的方法来做其它事情。

### table.primary()

*设置当前字段为表的主键字段。*

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

// 在添加新列之后就调用 primary()。
table.addColum("id").primary();
```

### table.autoIncrement()

*设置当前字段为自增字段。*

**参数：**

- `[start]` 起始值，默认为 `1`。
- `[step]` 自动增量的步长，默认为 `1`。（并非所有数据库都支持设置步长。）

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

table.addColumn("id").primary().autoIncrement();
```

### table.unique()

*设置当前字段的值是唯一的。*

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", [3, 15]).unique();
```

### table.default()

*为当前字段设置一个默认值。*

**参数：**

- `value` 默认值。

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

// 设置默认值为空字符串。
table.addColumn("name", "varchar", 25).default("");
```

### table.notNull()

*设置当前字段不能为空（null）。*

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", 25).default("").notNull();
```

### table.unsigned()

*设置当前字段为无符号数字。*

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

table.addColumn("level", "integer").unsigned();
```

### table.comment()

*添加一个注释到当前字段上。*

**参数：**

- `text` 注释文本。

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().comment("The primary key.");
```

### table.foreignKey()

*为当前字段设置外键约束。*

**参数：**

- `table` 外键所在的数据表，也可以设置为一个对象来同时设置所有的约束信息。
- `[field]` 外键所在表上的一个和当前字段对应的字段。
- `[onDelete]` 当记录被删除时触发的操作，可选值为：
    - `no action`
    - `set null` (默认)
    - `cascade`
    - `restrict`
- `[onUpdate]` 当记录被更新时触发的操作(并非所有数据库都支持)，可选值为：
    - `no action`
    - `set null`
    - `cascade`
    - `restrict`

**返回值：**

返回当前对象以便实现方法的链式调用。

```javascript
var table = new Table("users");

table.addColumn("level_id", "integer")
     .foreignKey("level", "id", "set null", "no action");

// 或者传递一个对象作为参数。
table.addColumn("level_id", "integer")
     .foreignKey({
         table: "level",
         field: "id",
         onUpdate: "set null",
         onDelete: "no action",
     });
```

### table.save()

*保存数据表，这个方法实际上在数据库中创建一个新的数据表。*

**别名：**

- `table.create()`

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是当前实例。

```javascript
var table = new Table("users");

// 在这里做一些事情...

table.save().then(table=>{
    console.log(table.sql);
    // sql 属性携带者用来创建数据表的 SQL 语句，即 DDL。
}).catch(err=>{
    console.log(err);
});
```

### table.getDDL()

*根据数据表的定义来获取 DDL。*

**返回值：**

返回 DDL 语句。

这个方法用来获取用于创建数据表的 DDL 语句，而不创建数据表。如果你调用了 
[table.save()](#table_save)，那么 DDL 会自动保存在 `table.sql` 属性中。

### Table.drop()

*从数据库中删除数据表。*

**参数：**

- `table` 你将要删除的数据表名称。

**返回值：**

返回一个 Promise，传递到 `then()` 的回调函数的中的唯一参数是一个新的数据表实例。

这个方法等价于 `new Table("table").drop()`。