
#### 内容列表

* [The Query Class](#The-Query-Class)
    * [事件](#事件)
    * [query.constructor()](#query_constructor)
    * [query.select()](#query_select)
    * [query.from()](#query_table)
    * [query.where()](#query_where)
    * [query.orWhere()](#query_orWhere)
    * [query.whereBetween()](#query_whereBetween)
    * [query.orWhereBetween()](#query_orWhereBetween)
    * [query.whereNotBetween()](#query_whereNotBetween)
    * [query.orWhereNotBetween()](#query_orWhereNotBetween)
    * [query.whereIn()](#query_whereIn)
    * [query.orWhereIn()](#query_orWhereIn)
    * [query.whereNotIn()](#query_whereNotIn)
    * [query.orWhereNotIn()](#query_orWhereNotIn)
    * [query.whereNull()](#query_whereNull)
    * [query.orWhereNull()](#query_orWhereNull)
    * [query.whereNotNull()](#query_whereNotNull)
    * [query.orWhereNotNull()](#query_orWhereNotNull)
    * [query.whereExists()](#query_whereExists)
    * [query.orWhereExists()](#query_orWhereExists)
    * [query.whereNotExists()](#query_whereNotExists)
    * [query.orWhereNotExists()](#query_orWhereNotExists)
    * [query.join()](#query_join)
    * [query.leftJoin()](#query_leftJoin)
    * [query.rightJoin](#query_rightJoin)
    * [query.fullJoin()](#query_fullJoin)
    * [query.crossJoin()](#query_crossJoin)
    * [query.orderBy()](#query_orderBy)
    * [query.random()](#query_random)
    * [query.groupBy()](#query_groupBy)
    * [query.having()](#query_having)
    * [query.limit()](#query_limit)
    * [query.distinct()](#query_distinct)
    * [query.union()](#query_union)
    * [query.insert()](#query_insert)
    * [query.update()](#query_update)
    * [query.increase()](#query_increase)
    * [query.decrease()](#query_decrease)
    * [query.delete()](#query_delete)
    * [query.get()](#query_get)
    * [query.all()](#query_all)
    * [query.count()](#query_count)
    * [query.max()](#query_max)
    * [query.min()](#query_min)
    * [query.avg()](#query_avg)
    * [query.sum()](#query_sum)
    * [query.chunk()](#query_chunk)
    * [query.paginate()](#query_paginate)
    * [query.getSelectSQL()](#query_getSelectSQL)

## Query 类

*查询构造器*

这个类提供了一大堆的方法，用来提供以面向对象的特性来产生 SQL 语句，并使用更简单和高效
的方式来操作数据。


### 事件

- `insert` 将会在一条新记录即将被插入数据库时触发。
- `inserted` 将会在一条新记录被成功插入数据库后触发。
- `update` 将会在一条记录即将被更新时触发。
- `updated` 将会在一条记录被成功更新后触发。
- `delete` 将会在一条记录即将被删除时触发。
- `deleted` 将会在一条记录被成功删除时触发。
- `get` 将会在一条记录被从数据库中成功取回时触发。

所有绑定到这些事件上的监听器函数都支持一个参数，即当前的 Query 实例。

### query.constructor()

*创建一个新实例，并指定一个数据表名。*

**签名：**

- `new Query(table?: string)`

```javascript
const { Query } = require("modelar");

// 使用一个给定的表名来创建新的查询实例。
var query = new Query("users");
```

### query.select()

*设置需要获取数据的字段。*

**签名：**

- `select(...fields: string[]): this`
- `select(fields: string[]): this`

```javascript
var query = new Query("users");

query.select("id", "name", "email");
query.select(["id", "name", "email"]);
```

### query.from()

*设置当前实例绑定的数据表名称。*

**签名：**

- `from(table: string): this`

**别名：**

- `from()`

```javascript
var query = new Query(); // 如果你不在这里传入表名，

// 那你可以在这里传入。
query.table("users").select("id", "name", "email");

// 你也可以使用它的别名，其可读性在 select 语句中更好。
query.select("id", "name", "email").from("users");
```

### query.where()

*为 SQL 语句设置一个 `where...` 子句。*

**签名：**

- `where(field: string, value: string | number | boolean | Date): this`
- `where(field: string, operator: string, value: string | number | boolean | Date): this`
- `where(fields: { [field: string]: string | number | boolean | Date }): this`
- `where(nested: (query: Query) => void): this`
- `where(field: string, nested: (query: Query) => void): this`
- `where(field: string, operator: string, nested: (query: Query) => void): this`

```javascript
var query = new Query("users");

query.where("id", "=", 1);
// 等于：
query.where("id", 1);
// 或者使用其它运算符：
query.where("name", "<>", "ayon");
// 甚至 like：
query.where("name", "like", "%hyurl%");
// 或者传递一个回调函数来产生嵌套的子句：
query.where("id", 1).where(_query=>{
    // _query 是一个新的查询实例。
    _query.where("name", "hyurl").orWhere("name", "test");
});
// 将会产生类似这样：
// where `id` = ? and (`name` = ? or `name` = ?);
// 伴随绑定参数 [1, 'hyurl', 'test']。

// 或者传递第二个参数为一个回调函数。
query.where("id", _query=>{
    _query.select("user_id").from("articles").where("id", 1);
});
// 将产生类似这样：
// where `id` = (select `user_id` from `articles` where `id` = ?);
// 伴随绑定参数 [1]。
```

### query.orWhere()

*为 SQL 语句设置一个 `where...or...` 子句。*

这个方法和 [query.where()](#query_where) 是相似的，请查看上面的文档。

### query.whereBetween()

*为 SQL 语句设置一个 `where...between...` 子句。*

**签名：**

- `whereBetween(field: string, [min, max]: [number, number]): this`

```javascript
var query = new Query("users");

query.whereBetween("id", [1, 10]); // where `id` between 1 and 10;
```

### query.orWhereBetween()

*为 SQL 语句设置一个 `where...or...between...` 子句。*

这个方法和 [query.whereBetween()](#query_whereBetween) 是相似的，请查看上面的
文档。

### query.whereNotBetween()

*为 SQL 语句设置一个 `where...not between...` 子句。*

这个方法和 [query.whereBetween()](#query_whereBetween) 是相似的，请查看上面的
文档。

### query.orWhereNotBetween()

*为 SQL 语句设置一个 `where...or...not between...` 子句。*

这个方法和 [query.whereBetween()](#query_whereBetween) 是相似的，请查看上面的
文档。

### query.whereIn()

*为 SQL 语句设置一个 `where...in...` 子句。*

**签名：**

- `whereIn(field: string, values: string[] | number[]): this`
- `whereIn(field: string, nested: (query: Query) => void): this`

```javascript
var query = new Query("users");

query.whereIn("id", [1, 2, 3, 4]); // where `id` in (1, 2, 3, 4);

// 或者传递一个回掉函数：
query.whereIn("id", _query => {
    // _query 是一个新的查询实例。
    _query.select("user_id").from("user_role").where("role_id", 1);
});
// where `id` in (select `user_id` from `user_role` where `role_id` = 1);
```

### query.orWhereIn()

*为 SQL 语句设置一个 `where...or...in...` 子句。*

这个方法和 [query.whereIn()](#query_whereIn) 是相似的，请查看上面的文档。


### query.whereNotIn()

*为 SQL 语句设置一个 `where...not in...` 子句。*

这个方法和 [query.whereIn()](#query_whereIn) 是相似的，请查看上面的文档。

### query.orWhereNotIn()

*为 SQL 语句设置一个 `where...or...not in...` 子句。*

这个方法和 [query.whereIn()](#query_whereIn) 是相似的，请查看上面的文档。

### query.whereNull()

*为 SQL 语句设置一个 `where...is null` 子句。*

**签名：**

- `whereNull(field: string): this`

```javascript
var query = new Query("users");

query.whereNull("email"); // where `email` is null;
```

### query.orWhereNull()

*为 SQL 语句设置一个 `where...or...is null` 子句。*

这个方法和 [query.whereNull()](#query_whereNull) 是相似的，请查看上面的文档。


### query.whereNotNull()

*为 SQL 语句设置一个 `where...is not null` 子句。*

这个方法和 [query.whereNull()](#query_whereNull) 是相似的，请查看上面的文档。

### query.orWhereNotNull()

*为 SQL 语句设置一个 `where...or...is not null` 子句。*

这个方法和 [query.whereNull()](#query_whereNull) 是相似的，请查看上面的文档。

### query.whereExists()

*为 SQL 语句设置一个 where exists... 子句。*

**签名：**

- `whereExists(nested: (query: Query) => void): this`

```javascript
var query = new Query("users");

query.whereExists(_query=>{
    // _query 是一个新的查询实例。
    _query.select("*").from("users").where("id", 1);
}); // where exists (select * from `users` where `id` = 1);
```

### query.orWhereExists()

*为 SQL 语句设置一个 `where...or exists...` 子句。*

这个方法和 [query.whereExists()](#query_whereExists) 是相似的，请查看上面的文档。


### query.whereNotExists()

*为 SQL 语句设置一个 `where not exists...` 子句。*

这个方法和 [query.whereExists()](#query_whereExists) 是相似的，请查看上面的文档。

### query.orWhereNotExists()

*为 SQL 语句设置一个 `where...or not exists...` 子句。*

这个方法和 [query.whereExists()](#query_whereExists) 是相似的，请查看上面的文档。


### query.join()

*为 SQL 语句设置一个 `inner join...` 子句。*

**签名：**

- `join(table: string, field1: string, field2: string): this`
- `join(table: string, field1: string, operator: string, field2: string): this`

```javascript
var query = new Query("users");

query.join("roles", "user.id", "=", "role.user_id");

query.join("roles", {"user.id": "role.user_id"});
// select * from `users` inner join `roles` on `user`.`id` = `role`.`user_id`;
```

### query.leftJoin()

*为 SQL 语句设置一个 `left join...` 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.rightJoin()

*为 SQL 语句设置一个 `right join...` 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.fullJoin()

*为 SQL 语句设置一个 `full join...` 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.crossJoin()

*为 SQL 语句设置一个 `cross join...` 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.orderBy()

*为 SQL 语句设置一个 `order by...` 子句。*

**签名：**

- `orderBy(field: string, sequence?: "asc" | "desc"): this`

```javascript
var query = new Query("users");

query.orderBy("id", "desc");
// 你也可以设置多个 order-by。
query.orderBy("name"); //sequence is optional.
// 这将会产生: select * from `users` order by `id` desc, `name`;
```

### query.random()

*设置数据库记录以随机的方式排序。*

**签名：**

- `random(): this`

```javascript
var query = new Query("users");

query.random();
// MySQL 中: order by rand();
// PostgreSQL 中: order by random();
```

### query.groupBy()

*为 SQL 语句设置一个 `group by...` 子句。*

**签名：**

- `groupBy(...fields: string[]): this`
- `groupBy(fields: string[]): this`

```javascript
var query = new Query("users");

query.groupBy("name"); // 传递一个字段
query.groupBy("name", "email"); // 传递两个字段
query.groupBy(["name", "email"]); // 传递一个数组。
```

### query.having()

*为 SQL 语句设置一个 `having...` 子句。*

**签名：**

- `having(raw: string): this`

```javascript
var query = new Query("users");

query.select("name", "sum(money)")
     .where("name", "hyurl")
     .groupBy("name")
     .having("sum(money) > 200");
// select `name`, sum(money) from `users` where `name` = 'hyurl' group by 
// `name` having sum(money) > 20;
```

### query.limit()

*为 SQL 语句设置一个 limit... 子句。*

**签名：**

- `limit(length: number, offset?: number): this`

```javascript
var query = new Query("users");

query.limit(10); // select * from `users` limit 10;
// 或者：
query.limit(10, 5); // select * from `users` limit 5, 10;
```

虽然一些数据库如 `mssql`、`oracledb`、`db2` 不支持 `limit` 字句，你依然可以使用
这个方法，适配器会将其转换为合适的查询语句。

### query.distinct()

**签名：**

- `distinct(): this`

```javascript
var query = new Query("users");

query.select("name").distinct(); // select distinct `name` from `users`;
```

### query.union()

*合并两个 SQL 语句为一个。*

**签名：**

- `union(query: string | Query, all?: boolean): this`
    - `all` Use `union all` to concatenate results.

```javascript
var query = new Query("users");

query.union("select * from `roles`");

// 或者传递另一个 Query 实例。
var query2 = new Query("roles");
query.union(query2);

// Union all:
query.union(query2, true);
```

### query.insert()

*插入一个新纪录到数据库中。*

**签名：**

- `insert(data: { [field: string]: any }): Promise<this>`

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

// 也可以传递一个数组，但是你必须为所有的字段都传递值。
query.insert([
    1, // id
    "hyurl", // name
    "i@hyurl.com", // email
    "123456", // password
]).then(query=>{
    console.log("A new user has been inserted.");
}).catch(err=>{
    console.log(err);
});
```

### query.update()

*更新一个已存在的记录。*

**签名：**

- `update(data: { [field: string]: any }): Promise<this>`

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

### query.increase()

*使用特定的数值来增长一个字段的值。*

**签名：**

- `increase(field: string, step?: number): Promise<this>`
- `increase(fields: { [field: string]: number }): Promise<this>`

```javascript
var query = new Query("users");

query.increase("score", 10).then(query=>{
    // 增长一个字段。
});

query.increase({score: 10, coin: 1}).then(query=>{
    // 增长多个字段。
});
```

### query.decrease()

*使用特定的数值来减小一个字段的值。*

**签名：**

- `decrease(field: string, step?: number): Promise<this>`
- `decrease(fields: { [field: string]: number }): Promise<this>`

```javascript
var query = new Query("users");

query.decrease("score", 10).then(query=>{
    // 减小一个字段。
});

query.decrease({score: 10, coin: 1}).then(query=>{
    // 减小多个字段。
});
```

### query.delete()

*删除一个已存在的记录。*

**签名：**

- `delete(): Promise<this>`

```javascript
var query = new Query("users");

query.where("id", 1).delete().then(query=>{
    console.log("The user has been deleted.");
}).catch(err=>{
    console.log(err);
})
```

### query.get()

*从数据库中获取一条记录。*

**签名：**

- `get(): Promise<{ [field: string]: any }>`

```javascript
var query = new Query("users");

query.where("id", 1).get().then(data=>{
    console.log(data); // data 将会是一个对象并包含记录的信息。
}).catch(err=>{
    console.log(err);
});
```

### query.all()

*从数据库中获取所有记录。*

**签名：**

- `all(): Promise<any[]>`

```javascript
var query = new Query("users");

query.all().then(data=>{
    console.log(data); // data 将会是一个数组并包含所有记录的信息。
}).catch(err=>{
    console.log(err);
});
```

### query.count()

*获取所有记录的数量或者特定字段的值的数量。*

**签名：**

- `count(field?: string): Promise<number>`

```javascript
var query = new Query("users");

// 计算所有记录。
query.count().then(count=>{
    console.log("There are "+count+" records in the table.");
}).catch(err=>{
    console.log(err);
});

// 计算所有的 name。
query.count("name").then(count=>{
    console.log("There are "+count+" names in the table.");
}).catch(err=>{
    console.log(err);
});
```

### query.max()

*获取数据表中一个特定字段的值的最大值。*

**签名：**

- `max(field: string): Promise<number>`

```javascript
var query = new Query("users");

// 获取最大的 id。
query.max("id").then(max=>{
    console.log("The maximum ID in the table is "+max+".");
}).catch(err=>{
    console.log(err);
});
```

### query.min()

*获取数据表中一个特定字段的值的最小值。*

**签名：**

- `min(field: string): Promise<number>`

```javascript
var query = new Query("users");

// 获取最小的 id。
query.max("id").then(min=>{
    console.log("The minimum ID in the table is "+min+".");
}).catch(err=>{
    console.log(err);
});
```

### query.avg()

*获取数据表中一个特定字段的平均值。*

**签名：**

- `avg(field: string): Promise<number>`

```javascript
var query = new Query("users");

// 获取所有 id 的平均值。
query.avg("id").then(num=>{
    console.log("The average of IDs is "+num+".");
}).catch(err=>{
    console.log(err);
});
```

### query.sum()

*获取数据表中一个特定字段的值的总和。*

**签名：**

- `sum(field: string): Promise<number>`

```javascript
var query = new Query("users");

// 获取所有 id 的总和。
query.sum("id").then(num=>{
    console.log("The summary of IDs is "+num+".");
}).catch(err=>{
    console.log(err);
});
```

### query.chunk()

*使用一个特定的长度来处理分段的数据。*

**签名：**

- `chunk(length: number, cb: (data: any[]) => false | void): Promise<any[]>`

这个方法会遍历所有符合 SQL 查询语句的记录，如果你想要手动停止它，只需要在回调函数中
返回 `false` 即可。

```javascript
var query = new Query("users");

query.chunk(10, data=>{
    // data 是一个数组并携带者所有的记录。
    console.log(data);
}).then(data=>{
    // 这个 data 是最后一个片段的 data。
}).catch(err=>{
    console.log(err);
});
```

### query.paginate()

*获取所有符合给出条件的数据库记录的分页信息。*

**签名：**

- `paginate(page: number, length?: number): Promise<PaginatedRecords>`
    - `length` 每一页获取数量的上限，默认是 `10`。当然你也可以在调用该函数之前调用
        `query.limit()` 来设置一个特定的长度。

`PaginatedRecords` 接口包含：

- `page: number` 当前页；
- `limit: number` 每一页获取数量的上限；
- `pages: number` 所有的页码数量。
- `total: number` 所有的记录数量。
- `data: any[]` 一个携带所有数据的数组。

```javascript
var query = Query("users");

query.where("id", ">", 0).paginate(1, 15).then(info=>{
    console.log(info);
    // 它将会是像这样的：
    // {
    //     page: 1,
    //     limit: 15,
    //     pages: 2,
    //     total: 24,
    //     data: [...]
    // }
}).catch(err=>{
    console.log(err);
});

// 当然你也可以这么做：
query.limit(15).paginate(1).then(info=>{
    // ...
});
```

### query.getSelectSQL()

*产生一个 Select 查询语句。*

**签名：**

- `getSelectSQL(): string`

```javascript
var query = new Query("users");
var sql = query.select("*").where("id", 1).getSelectSQL();
console.log(sql);
// select * `users` where `id` = 1
```