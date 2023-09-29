
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
    * [table.drop()](#table_drop)
    * [Table.drop()](#Table_drop)

## Table 类

*数据表建构器*

这是一个用于产生 DDL 语句并为模型创建数据表的工具，它提供了一些很有用的方法，使你能够
花很少力气就能够创建数据表。

### table.constructor()

*使用一个特定的表名来创建数据表实例。*

**签名：**

- `new Table(name: string, schema?: { [field: string]: FieldConfig; })`
- `new Table(model: Model)`

```javascript
const { Table } = require("modelar");

var table = new Table("users");

// 携带 schema:
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
如果你正在使用 TypeScript 编程，并且使用装饰器来定义模型类，那么你可以将一个模型实例
传递给构造器。

```typescript
import { Table, User } from "modelar"; // User 类是使用 TypeScript 编写的。

var table = new Table(new User);
// 或者
var table = new Table("users", User.prototype.schema);
// 使用装饰器定义的字段保存在 `Model.prototype.shcema` 中。
```

## table.addColumn()

*向表中添加一个新列。*

**签名：**

- `addColumn(name: string): this`
- `addColumn(name: string, type: string): this`
- `addColumn(name: string, type: string, length: number | [number, number]): this`
- `addColumn(field: FieldConfig): this`

`FieldConfig` 包含：

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

`ForeignKeyConfig` 包含：

- `table: string` 外键所指向的表。
- `field: string`
- `onDelete?: "no action" | "set null" | "cascade" | "restrict"` 当记录被删除时
    执行的操作，默认为 `set null`.
- `onUpdate?: "no action" | "set null" | "cascade" | "restrict"` 当记录被更新时
    执行的操作，默认为 `no action`.

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

**签名：**

- `primary(): this`

```javascript
var table = new Table("users");

// 在添加新列之后就调用 primary()。
table.addColum("id").primary();
```

### table.autoIncrement()

*设置当前字段为自增字段。*

**签名：**

- `autoIncrement(): this`
- `autoIncrement(start: number, step?: number): this`

**注意: 并非所有的数据库都支持 `step`。**

```javascript
var table = new Table("users");

table.addColumn("id").primary().autoIncrement();
```

### table.unique()

*设置当前字段的值是唯一的。*

**签名：**

- `unique(): this`

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", [3, 15]).unique();
```

### table.default()

*为当前字段设置一个默认值。*

**签名：**

- `default(value: any): this`

```javascript
var table = new Table("users");

// 设置默认值为空字符串。
table.addColumn("name", "varchar", 25).default("");
```

### table.notNull()

*设置当前字段不能为空（null）。*

**签名：**

- `notNull(): this`

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", 25).default("").notNull();
```

### table.unsigned()

*设置当前字段为无符号数字。*

**签名：**

- `unsigned(): this`

```javascript
var table = new Table("users");

table.addColumn("level", "integer").unsigned();
```

### table.comment()

*添加一个注释到当前字段上。*

**签名：**

- `comment(text: string): this`

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().comment("The primary key.");
```

### table.foreignKey()

*为当前字段设置外键约束。*

**签名：**

- `foreignKey(config: ForeignKeyConfig): this`
- `foreignKey(table: string, field: string, onDelete?: string, onUpdate?: string): this`

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

**签名：**

- `save(): Promise<this>`

**别名：**

- `table.create()`

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

**签名：**

- `getDDL(): string`

这个方法用来获取用于创建数据表的 DDL 语句，而不创建数据表。如果你调用了 
[table.save()](#table_save)，那么 DDL 会自动保存在 `table.sql` 属性中。

### table.drop()

*从数据库中删除数据表。*

**签名：**

- `drop(): Promise<this>`

### Table.drop()

*从数据库中删除数据表。*

**签名：**

- `drop(table: string): Promise<Table>`

这个方法等价于 `new Table("table").drop()`。