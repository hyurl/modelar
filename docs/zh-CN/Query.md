
#### 内容列表

* [The Query Class](#The-Query-Class)
    * [query.constructor()](#query_constructor)
    * [query.select()](#query_select)
    * [query.table()](#query_table)
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
    * [预定义事件](#预定义事件)

## Query 类

*查询构造器*

这个类提供了一大堆的方法，用来提供以面向对象的特性来产生 SQL 语句，并使用更简单和高效
的方式来操作数据。

### query.constructor()

*创建一个新实例，并绑定一个特定的数据表名。*

**参数：**

- `[table]` 绑定到实例上的数据表名。

```javascript
const { Query } = require("modelar");

// 使用一个给定的表名来创建新的查询实例。
var query = new Query("users");
```

### query.select()

*设置需要获取数据的字段。*

**参数：**

- `fields` 一个包含所有字段的列表，每一个字段作为一个参数传入，或者只传入第一个参数
    为一个包含多个字段的数组。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.select("id", "name", "email");
// 或者传入一个数组作为第一个参数。
query.select(["id", "name", "email"]);
```

### query.table()

*设置当前实例绑定的数据表名称。*

**参数：**

- `table` 数据表名。

**返回值：**

放回当前实例以便实现方法的链式调用。

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

*为 SQL 语句设置一个 where 子句。*

**参数：**

- `field` 这可以是一个字段名，或者使用一个对象来同时设置多个 `=`（相等）条件。或者
    传递一个回调函数来产生嵌套的条件子句，唯一一个传递到回调函数中的参数是一个新的
    Query 对象。
- `[operator]` 条件运算符，如果 `value` 没有被传入，那么这个参数将替换它，而运算符
    将变成一个 `=`。另外也可以将这个参数传递为一个回调函数来产生一个 SQL 子查询语句，
    唯一一个传递到回调函数中的参数是一个新的 Query 实例，从而可以用它的特性来产生 
    SQL 语句。
- `[value]` 一个用来与 `field` 进行比较的值，如果这个参数没有传递，那么将用 
    `operator` 替换它，而运算符将变成一个 `=`。

**返回值：**

放回当前实例以便实现方法的链式调用。

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

*为 SQL 语句设置一个 where...or... 子句。*

这个方法和 [query.where()](#query_where) 是相似的，请查看上面的文档。

### query.whereBetween()

*为 SQL 语句设置一个 where...between... 子句。*

**参数：**

- `field` 一个当前实例所绑定的数据表中的字段名。
- `range` 一个携带者两个元素的的数组，用来表示开始和结束的区间。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.whereBetween("id", [1, 10]); // where `id` between 1 and 10;
```

### query.orWhereBetween()

*为 SQL 语句设置一个 where...or...between... 子句。*

这个方法和 [query.whereBetween()](#query_whereBetween) 是相似的，请查看上面的
文档。

### query.whereNotBetween()

*为 SQL 语句设置一个 where...not between... 子句。*

这个方法和 [query.whereBetween()](#query_whereBetween) 是相似的，请查看上面的
文档。

### query.orWhereNotBetween()

*为 SQL 语句设置一个 where...or...not between... 子句。*

这个方法和 [query.whereBetween()](#query_whereBetween) 是相似的，请查看上面的
文档。

### query.whereIn()

*为 SQL 语句设置一个 where...in... 子句。*

**参数：**

- `field` 一个当前实例所绑定的数据表中的字段名。
- `values` 一个包含所有可能值的数组。或者传递一个回调函数以便用来产生 SQL 子查询
    语句，唯一一个传递到回调函数中的参数是一个新的 Query 实例，从而你可以使用它的
    特性来产生 SQL 语句。

**返回值：**

放回当前实例以便实现方法的链式调用。

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

*为 SQL 语句设置一个 where...or...in... 子句。*

这个方法和 [query.whereIn()](#query_whereIn) 是相似的，请查看上面的文档。


### query.whereNotIn()

*为 SQL 语句设置一个 where...not in... 子句。*

这个方法和 [query.whereIn()](#query_whereIn) 是相似的，请查看上面的文档。

### query.orWhereNotIn()

*为 SQL 语句设置一个 where...or...not in... 子句。*

这个方法和 [query.whereIn()](#query_whereIn) 是相似的，请查看上面的文档。

### query.whereNull()

*为 SQL 语句设置一个 where...is null 子句。*

**参数：**

- `field` 一个当前实例所绑定的数据表中的字段名。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.whereNull("email"); // where `email` is null;
```

### query.orWhereNull()

*为 SQL 语句设置一个 where...or...is null 子句。*

这个方法和 [query.whereNull()](#query_whereNull) 是相似的，请查看上面的文档。


### query.whereNotNull()

*为 SQL 语句设置一个 where...is not null 子句。*

这个方法和 [query.whereNull()](#query_whereNull) 是相似的，请查看上面的文档。

### query.orWhereNotNull()

*为 SQL 语句设置一个 where...or...is not null 子句。*

这个方法和 [query.whereNull()](#query_whereNull) 是相似的，请查看上面的文档。

### query.whereExists()

*为 SQL 语句设置一个 where exists... 子句。*

**参数：**

- `callback` 传递一个回调函数用来产生 SQL 子查询语句，唯一一个传递到回调函数中的
    参数是一个新的 Query 实例，从而你可以使用它的特性来产生 SQL 语句。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.whereExists(_query=>{
    // _query 是一个新的查询实例。
    _query.select("*").from("users").where("id", 1);
}); // where exists (select * from `users` where `id` = 1);
```

### query.orWhereExists()

*为 SQL 语句设置一个 where...or exists... 子句。*

这个方法和 [query.whereExists()](#query_whereExists) 是相似的，请查看上面的文档。


### query.whereNotExists()

*为 SQL 语句设置一个 where not exists... 子句。*

这个方法和 [query.whereExists()](#query_whereExists) 是相似的，请查看上面的文档。

### query.orWhereNotExists()

*为 SQL 语句设置一个 where...or not exists... 子句。*

这个方法和 [query.whereExists()](#query_whereExists) 是相似的，请查看上面的文档。


### query.join()

*为 SQL 语句设置一个 inner join... 子句。*

**参数：**

- `table` 一个需要被联结的数据表名。
- `field1` 一个当前实例所绑定的数据表中的字段名。
- `operator` 条件运算符，如果 `field2` 没有被传入，那么这个参数将会替换掉它，而运算
    符将变成一个 `=`。
- `[field2]` 一个在 `table` 中的字段，用于和 `field1` 进行比较。如果这个参数没有被
    传入，那么 `operator` 将替换它，而运算符则将变成一个 `=`。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.join("roles", "user.id", "=", "role.user_id");
// 或者传入一个对象：
query.join("roles", {"user.id": "role.user_id"});
// select * from `users` inner join `roles` on `user`.`id` = `role`.`user_id`;
```

### query.leftJoin()

*为 SQL 语句设置一个 left join... 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.rightJoin()

*为 SQL 语句设置一个 right join... 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.fullJoin()

*为 SQL 语句设置一个 full join... 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.crossJoin()

*为 SQL 语句设置一个 cross join... 子句。*

这个方法和 [query.join()](#query_join) 是相似的，请查看上面的文档。

### query.orderBy()

*为 SQL 语句设置一个 order by... 子句。*

**参数：**

- `field` 一个当前实例所绑定的数据表中的字段名。
- `[sequence]` 数据库记录组织的方式，可以是 `asc` 或 `desc`。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.orderBy("id", "desc");
// 你也可以设置多个 order-by。
query.orderBy("name"); //sequence is optional.
// 这将会产生: select * from `users` order by `id` desc, `name`;
```

### query.random()

*设置数据库记录以随机的方式排序。*

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.random();
// MySQL 中: order by rand();
// PostgreSQL 和 SQLite 中: order by random();
```

### query.groupBy()

*为 SQL 语句设置一个 by... clause 子句。*

**参数：**

- `field` 一个由目标字段组成的列表，每一个字段传递为一个参数，或者传递第一个参数为
    一个数组，并包含所有的字段名称。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.groupBy("name"); // 传递一个字段
query.groupBy("name", "email"); // 传递两个字段
query.groupBy(["name", "email"]); // 传递一个数组。
```

### query.having()

*为 SQL 语句设置一个 having... 子句。*

**参数：**

- `raw` 一个用来设置比较条件的 SQL 子句。

**返回值：**

放回当前实例以便实现方法的链式调用。

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

**参数：**

- `length` 当前查询将会取到的记录数量的上限。
- `[offset]` 设置起点偏移值，从 `0` 开始计算。

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.limit(10); // select * from `users` limit 10;
// 或者：
query.limit(10, 5); // select * from `users` limit 5, 10;
```

### query.distinct()

*在一个 Select 语句中设置一个唯一性条件来插叙不重复的记录。*

**返回值：**

放回当前实例以便实现方法的链式调用。

```javascript
var query = new Query("users");

query.select("name").distinct(); // select distinct `name` from `users`;
```

### query.union()

*合并两个 SQL 语句为一个。*

**参数：**

- `query` 可以是一个 SQL 语句，或者是一个 Query 实例。
- `[all]` 使用 `union all` 来合并结构，默认是 `false`。

**返回值：**

放回当前实例以便实现方法的链式调用。

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

**参数：**

- `data` 一个包含字段和值的键值对，或者传递一个携带者满足所有字段的值的数组。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `data` 一个携带着键值对的对象。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

<small>(自 1.0.5 版本起)</small>
*使用特定的数值来增长一个字段的值。*

**参数：**

- `field` 设置需要增长值的记录所在的字段，也可以传递这个参数为一个对象来同时增长多个
    字段的值。
- `[number]` 需要增长的数值，默认是 `1`。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

<small>(自 1.0.5 版本起)</small>
*使用特定的数值来减小一个字段的值。*

**参数：**

- `field` 设置需要减小值的记录所在的字段，也可以传递这个参数为一个对象来同时减小多个
    字段的值。
- `[number]` 需要增长的数值，默认是 `1`。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `[field]` 计算一个特定的字段。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `field` 特定的字段。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `field` 特定的字段。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `field` 特定的字段。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `field` 特定的字段。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `langth` 设置每一个片段将会携带的记录数量的上限。
- `callback` 一个用来处理所有分段数据的函数，唯一一个传递到函数中的参数是当前片段所
    携带的记录。如果这个函数返回一个 `false`，那么分段处理将终止。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是当前实例。

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

**参数：**

- `[page]` 设置当前页，默认是 `1`。
- `[length]` 每一页获取数量的上限，默认是 `10`。当然你也可以在调用该函数之前调用
    `query.limit()` 来设置一个特定的长度。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 中的回调函数的参数是一个对象，并包含这些
信息：

* `page` 当前页；
* `limit` 每一页获取数量的上限；
* `pages` 所有的页码数量。
* `total` 所有的记录数量。
* `data` 一个携带所有数据的数组。

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

**返回值：**

返回查询语句。

```javascript
var query = new Query("users");
var sql = query.select("*").where("id", 1).getSelectSQL();
console.log(sql);
// select * `users` where `id` = 1
```

### 预定义事件

在 Query 层面上，有这一些事件你可以设置事件处理器到它们上面：

- `query` 这个事件将会在一条 SQL 语句即将被执行时时触发。
- `insert` 这个事件将会在一条新记录即将被插入数据库时触发。
- `inserted` 这个事件将会在一条新记录被成功插入数据库后触发。
- `update` 这个事件将会在一条记录即将被更新时触发。
- `updated` 这个事件将会在一条记录被成功更新后触发。
- `delete` 这个事件将会在一条记录即将被删除时触发。
- `deleted` 这个事件将会在一条记录被成功删除时触发。
- `get` 这个事件将会在一条记录被从数据库中成功取回时触发。