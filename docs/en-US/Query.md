
#### Table of Contents

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
    * [Pre-defined Events](#Pre-defined-Events)

## The Query class

*Query Constructor for SQL statements and beyond.*

This class provides a bunch of methods with Object-Oriented features to 
make generating SQL statements and handling data more easier and efficient.

### query.constructor()

*Creates a new instance with a specified table name binding to it.*

**parameters:**

- `[table]` The table name binds to the instance.

```javascript
const { Query } = require("modelar");

// Instanciate a new query with the given table.
var query = new Query("users");
```

### query.select()

*Sets what fields that need to be fetched.*

**parameters:**

- `fields`  A list of all target fields, each one passed as an argument, or 
    just pass the first argument as an array that carries all the field names.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select("id", "name", "email");
// Or just pass an array as its first argument.
query.select(["id", "name", "email"]);
```

### query.table()

*Sets the table name that the current instance binds to.*

**parameters:**

- `table` The table name.

**return:**

Returns the current instance for function chaining.

**alias:**

- `from()`

```javascript
var query = new Query(); // If you don't pass a table name here,

// you can bind it here.
query.table("users").select("id", "name", "email");

// You can use its alias, which is more readable in select statements.
query.select("id", "name", "email").from("users");
```

### query.where()

*Sets a where... clause for the SQL statement.*

**parameters:**

- `field` This could be a field name, or an object that sets multiple `=` 
    (equal) conditions for the clause. Or pass a callback function to generate
    nested conditions, the only argument passed to the callback is a new Query
    instance with its features.
- `[operator]` Condition operator, if the `value` isn't passed, then this 
    argument will replace it, and the operator will become an `=`. It is also 
    possible to pass this argument a callback function to generate a child-SQL 
    statement, the only argument passed to the callback is a new Query 
    instance, so that you can use its features to generate a SQL statement.
- `[value]` A value that needs to be compared with `field`. If this argument 
    is missing, then `operator` will replace it, and the operator will become 
    an `=`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.where("id", "=", 1);
// Equals to
query.where("id", 1);
// Or use other operators.
query.where("name", "<>", "ayon");
// Even like
query.where("name", "like", "%hyurl%");
// Or pass a callback for nested clause.
query.where("id", 1).where(_query=>{
    // _query is a new query instance.
    _query.where("name", "hyurl").orWhere("name", "test");
});
// Will generate like this: 
// where `id` = ? and (`name` = ? or `name` = ?);
// with bindings [1, 'hyurl', 'test'].

// Or pass the second argument a callback function.
query.where("id", _query=>{
    _query.select("user_id").from("articles").where("id", 1);
});
// Will generate like this: 
// where `id` = (select `user_id` from `articles` where `id` = ?);
// with bindings [1].
```

### query.orWhere()

*Sets an where...or... clause for the SQL statement.*

This method is similar to [query.where()](#query_where), please check the 
documentation above.

### query.whereBetween()

*Sets a where...between... clause for the SQL statement.*

**parameters:**

- `field` A field name in the table that currently binds to.
- `range` An array that carries only two elements which represent the start 
    point and the end point.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereBetween("id", [1, 10]); // where `id` between 1 and 10;
```

### query.orWhereBetween()

*Sets an where...or...between... clause for the SQL statement.*

This method is similar to [query.whereBetween()](#query_whereBetween), please 
check the documentation above.

### query.whereNotBetween()

*Sets an where...not between... clause for the SQL statement.*

This method is similar to [query.whereBetween()](#query_whereBetween), please 
check the documentation above.

### query.orWhereNotBetween()

*Sets an where...or...not between... clause for the SQL statement.*

This method is similar to [query.whereBetween()](#query_whereBetween), please 
check the documentation above.

### query.whereIn()

*Sets a where...in... clause for the SQL statement.*

**parameters:**

- `field` A field name in the table that currently binds to.
- `values` An array that carries all possible values. Or pass a callback 
    function to generate child-SQL statement, the only argument passed to the 
    callback is a new Query instance, so that you can use its features to 
    generate a SQL statement.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereIn("id", [1, 2, 3, 4]); // where `id` in (1, 2, 3, 4);

// Or pass values as an callback.
query.whereIn("id", _query => {
    // _query is a new query instance.
    _query.select("user_id").from("user_role").where("role_id", 1);
});
// where `id` in (select `user_id` from `user_role` where `role_id` = 1);
```

### query.orWhereIn()

*Sets an where...or...in... clause for the SQL statement.*

This method is similar to [query.whereIn()](#query_whereIn), please check the 
documentation above.

### query.whereNotIn()

*Sets an where...not in... clause for the SQL statement.*

This method is similar to [query.whereIn()](#query_whereIn), please check the 
documentation above.

### query.orWhereNotIn()

*Sets an where...or...not in... clause for the SQL statement.*

This method is similar to [query.whereIn()](#query_whereIn), please check the 
documentation above.

### query.whereNull()

*Sets a where...is null clause for the SQL statement.*

**parameters:**

- `field` A field name in the table that currently binds to.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereNull("email"); // where `email` is null;
```

### query.orWhereNull()

*Sets a where...or...is null clause for the SQL statement.*

This method is similar to [query.whereNull()](#query_whereNull), please check 
the documentation above.

### query.whereNotNull()

*Sets a where...is not null clause for the SQL statement.*

This method is similar to [query.whereNull()](#query_whereNull), please check 
the documentation above.

### query.orWhereNotNull()

*Sets a where...or...is not null clause for the SQL statement.*

This method is similar to [query.whereNull()](#query_whereNull), please check 
the documentation above.

### query.whereExists()

*Sets a where exists... clause for the SQL statement.*

**parameters:**

- `callback` Pass a callback function to generate child-SQL statement, the 
    only argument passed to the callback is a new Query instance, so that you 
    can use its features to generate a SQL statement.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereExists(_query=>{
    // _query is a new query instance.
    _query.select("*").from("users").where("id", 1);
}); // where exists (select * from `users` where `id` = 1);
```

### query.orWhereExists()

*Sets an where...or exists... clause for the SQL statement.*

This method is similar to [query.whereExists()](#query_whereExists), please 
check the documentation above.

### query.whereNotExists()

*Sets an where not exists... clause for the SQL statement.*

This method is similar to [query.whereExists()](#query_whereExists), please 
check the documentation above.

### query.orWhereNotExists()

*Sets an where...or not exists... clause for the SQL statement.*

This method is similar to [query.whereExists()](#query_whereExists), please 
check the documentation above.

### query.join()

*Sets a inner join... clause for the SQL statement.*

**parameters:**

- `table` A table name that needs to be joined with.
- `field1` A field name in the table that currently binds to.
- `operator` Condition operator, if the `field2` isn't passed, then this 
    argument will replace it, and the operator will become an `=`.
- `[field2]` A field in `table` that needs to be compared with `field1`. If 
    this argument is missing, then `operator` will replace it, and the 
    operator will become an `=`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.join("roles", "user.id", "=", "role.user_id");
// Or pass a object:
query.join("roles", {"user.id": "role.user_id"});
// select * from `users` inner join `roles` on `user`.`id` = `role`.`user_id`;
```

### query.leftJoin()

*Sets a left join... clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.rightJoin()

*Sets a right join... clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.fullJoin()

*Sets a full join... clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.crossJoin()

*Sets a cross join... clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.orderBy()

*Sets an order by... clause for the SQL statement.*

**parameters:**

- `field` A field name in the table that currently binds to.
- `[sequence]` The way of how records ordered, it could be either `asc` or 
    `desc`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.orderBy("id", "desc");
// You can set multiple order-bys as well.
query.orderBy("name"); // sequence is optional.
// This will be: select * from `users` order by `id` desc, `name`;
```

### query.random()

*Sets that the records will be ordered in random sequence.*

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.random();
// In MySQL: order by rand();
// In PostgreSQL and SQLite: order by random();
```

### query.groupBy()

*Sets a group by... clause for the SQL statement.*

**parameters:**

- `field` A list of all target fields, each one passed as an argument. Or just
    pass the first argument as an array that carries all the field names.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.groupBy("name"); // Pass one field.
query.groupBy("name", "email"); // Pass two fields.
query.groupBy(["name", "email"]); // Pass an array.
```

### query.having()

*Sets a having... clause for the SQL statement.*

**parameters:**

- `raw` A SQL clause for defining comparing conditions.

**return:**

Returns the current instance for function chaining.

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

*Sets a limit... clause for the SQL statement.*

**parameters:**

- `length` The top limit of how many counts that this query will fetch.
- `[offset]` The start point, count from `0`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.limit(10); // select * from `users` limit 10;
// Or:
query.limit(10, 5); // select * from `users` limit 5, 10;
```

### query.distinct()

*Sets a distinct condition to get unique results in a select statement.*

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select("name").distinct(); //select distinct `name` from `users`;
```

### query.union()

*Unites two SQL statements into one.*

**parameters:**

- `query` Could be a SQL statement, or a Query instance.
- `[all]` Use `union all` to concatenate results, default is `false`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.union("select * from `roles`");

// Or pass another Query instance.
var query2 = new Query("roles");
query.union(query2);

// Union all:
query.union(query2, true);
```

### query.insert()

*Inserts a new record into the database.*

**parameters:**

- `data` An object that carries fields and their values, or pass all values in
    an array that fulfil all the fields.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

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

// Also possible to pass an array, but you have to pass the values for all the 
// fields.
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

*Updates an existing record.*

**parameters:**

- `data` An object that carries fields and their values.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

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

<small>(Since 1.0.5)</small>
*Increases a specified field with a specified number.*

**parameters:**

- `field` The field name of which record needs to be increased. It is also 
    possible to pass this argument an object to increase multiple fields.
- `[number]` A number that needs to be raised, default is `1`.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var query = new Query("users");

query.increase("score", 10).then(query=>{
    // Increase one field.
});

query.increase({score: 10, coin: 1}).then(query=>{
    // Increase multiple fields.
});
```

### query.decrease()

<small>(Since 1.0.5)</small>
*Decreases a specified field with a specified number.*

**parameters:**

- `field` The field name of which record needs to be decreased. It is also 
    possible to pass this argument an object to decrease multiple fields.
- `[number]` A number that needs to be reduced, default is `1`.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var query = new Query("users");

query.decrease("score", 10).then(query=>{
    // Decrease one field.
});

query.decrease({score: 10, coin: 1}).then(query=>{
    // Decrease multiple fields.
});
```

### query.delete()

*Deletes an existing record.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var query = new Query("users");

query.where("id", 1).delete().then(query=>{
    console.log("The user has been deleted.");
}).catch(err=>{
    console.log(err);
})
```

### query.get()

*Gets a record from the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the fetched data.

```javascript
var query = new Query("users");

query.where("id", 1).get().then(data=>{
    console.log(data); // The data will be an object that carries the record.
}).catch(err=>{
    console.log(err);
});
```

### query.all()

*Gets all records from the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is all the fetched data carried in an array.

```javascript
var query = new Query("users");

query.all().then(data=>{
    console.log(data); // The data will be an array that carries all records.
}).catch(err=>{
    console.log(err);
});
```

### query.count()

*Gets all counts of records or a specified filed.*

**parameter:**

- `[field]` Count a specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

// Count all records.
query.count().then(count=>{
    console.log("There are "+count+" records in the table.");
}).catch(err=>{
    console.log(err);
});

// Count all names.
query.count("name").then(count=>{
    console.log("There are "+count+" names in the table.");
}).catch(err=>{
    console.log(err);
});
```

### query.max()

*Gets the maximum value of a specified field in the table.*

**parameter:**

- `field` The specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

// Get the maximun id.
query.max("id").then(max=>{
    console.log("The maximum ID in the table is "+max+".");
}).catch(err=>{
    console.log(err);
});
```

### query.min()

*Gets the minimum value of a specified field in the table.*

**parameter:**

- `field` The specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

// Get the mimimun id.
query.max("id").then(min=>{
    console.log("The minimum ID in the table is "+min+".");
}).catch(err=>{
    console.log(err);
});
```

### query.avg()

*Gets the average value of a specified field in the table.*

**parameter:**

- `field` The specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

// Get the average of ids.
query.avg("id").then(num=>{
    console.log("The average of IDs is "+num+".");
}).catch(err=>{
    console.log(err);
});
```

### query.sum()

*Gets the summarized value of a specified field in the table.*

**parameter:**

- `field` The specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

// Get the summarized value of ids.
query.sum("id").then(num=>{
    console.log("The summary of IDs is "+num+".");
}).catch(err=>{
    console.log(err);
});
```

### query.chunk()

*Processes chunked data with a specified length.*

**parameters:**

- `langth` The top limit of how many records that each chunk will carry.
- `callback` A function for processing every chunked data, the only argument 
    passed to it is the data that current chunk carries. If the callback 
    returns `false`, stop chunking.

**return:**

Returns a Promise, and the only argument passed to the callback of `then()` is 
the last chunk of data.

This method walks through all the records that suit the SQL statement. if you 
want to stop it manually, just return `false` in the callback function.

```javascript
var query = new Query("users");

query.chunk(10, data=>{
    // data is an array that carries all the records.
    console.log(data);
}).then(data=>{
    // This data is the last chunked data.
}).catch(err=>{
    console.log(err);
});
```

### query.paginate()

*Gets paginated information of all records that suit given conditions.*

**parameters:**

- `[page]` The current page, default is `1`.
- `[length]` The top limit of per page, default is `10`. Also you can call 
    `query.limit()` to specify a length before calling this method.

**return:**

Returns a Promise, the only argument passes to the callback of `then()` is an 
object that carries the information, it includes:

* `page` The current page.
* `limit` The top limit of per page.
* `pages` A number of all record pages.
* `total` A number of all record counts.
* `data` An array that carries all fetched data.

```javascript
var query = Query("users");

query.where("id", ">", 0).paginate(1, 15).then(info=>{
    console.log(info);
    // It will be like this:
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

// Also, you can do:
query.limit(15).paginate(1).then(info=>{
    // ...
});
```

### query.getSelectSQL()

*Generates a select statement.*

**return:**

The select statement.

```javascript
var query = new Query("users");
var sql = query.select("*").where("id", 1).getSelectSQL();
console.log(sql);
// select * `users` where `id` = 1
```

### Pre-defined Events

At Query level, there are some events you can set handlers to:

- `query` This event will be fired when the SQL statement is about to be 
    executed.
- `insert` This event will be fired when a new record is about to be inserted 
    into the database.
- `inserted` This event will be fired when a new record is successfully 
    inserted into the database.
- `update` This event will be fired when a record is about to be updated.
- `updated` This event will be fired when a record is successfully updated.
- `delete` This event will be fired when a record is about to be deleted.
- `deleted` This event will be fired when a record is successfully deleted.
- `get` This event will be fired when a record is successfully fetched from 
    the database.