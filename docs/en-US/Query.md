
#### Table of Contents

* [The Query Class](#The-Query-Class)
    * [Events](#Events)
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

## The Query class

*Query Builder and beyond.*

This class provides a bunch of methods with Object-Oriented features to 
generate SQL statements and handle data in a more easier and efficient way.

### Events

- `insert` Fired when a new record is about to be inserted into the database.
- `inserted` Fired when a new record is successfully inserted into the database.
- `update` Fired when a record is about to be updated.
- `updated` Fired when a record is successfully updated.
- `delete` Fired when a record is about to be deleted.
- `deleted` Fired when a record is successfully deleted.
- `get` Fired when a record is successfully fetched from the database.

All the listeners bound to these events accept a parameter, which is the 
current Query instance.

### query.constructor()

*Creates a new Query instance with a specified table name.*

**signatures:**

- `new Query(table?: string)`

```javascript
const { Query } = require("modelar");

// Instanciate a new query with the given table.
var query = new Query("users");
```

### query.select()

*Sets what fields that need to be fetched.*

**signatures:**

- `select(...fields: string[]): this`
- `select(fields: string[]): this`

```javascript
var query = new Query("users");

query.select("id", "name", "email");
query.select(["id", "name", "email"]);
```

### query.from()

*Sets the table name that the current instance binds to.*

**signatures:**

- `from(table: string): this`

```javascript
var query = new Query();

query.select("id", "name", "email").from("users");
```

### query.where()

*Sets a `where...` clause for the SQL statement.*

**signatures:**

- `where(field: string, value: string | number | boolean | Date): this`
- `where(field: string, operator: string, value: string | number | boolean | Date): this`
- `where(fields: { [field: string]: string | number | boolean | Date }): this`
- `where(nested: (query: Query) => void): this`
- `where(field: string, nested: (query: Query) => void): this`
- `where(field: string, operator: string, nested: (query: Query) => void): this`

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

*Sets an `where...or...` clause for the SQL statement.*

This method is similar to [query.where()](#query_where), please check the 
documentation above.

### query.whereBetween()

*Sets a `where...between...` clause for the SQL statement.*

**signatures:**

- `whereBetween(field: string, [min, max]: [number, number]): this`

```javascript
var query = new Query("users");

query.whereBetween("id", [1, 10]); // where `id` between 1 and 10;
```

### query.orWhereBetween()

*Sets an `where...or...between...` clause for the SQL statement.*

This method is similar to [query.whereBetween()](#query_whereBetween), please 
check the documentation above.

### query.whereNotBetween()

*Sets an `where...not between...` clause for the SQL statement.*

This method is similar to [query.whereBetween()](#query_whereBetween), please 
check the documentation above.

### query.orWhereNotBetween()

*Sets an `where...or...not between...` clause for the SQL statement.*

This method is similar to [query.whereBetween()](#query_whereBetween), please 
check the documentation above.

### query.whereIn()

*Sets a `where...in...` clause for the SQL statement.*

**signatures:**

- `whereIn(field: string, values: string[] | number[]): this`
- `whereIn(field: string, nested: (query: Query) => void): this`

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

*Sets an `where...or...in...` clause for the SQL statement.*

This method is similar to [query.whereIn()](#query_whereIn), please check the 
documentation above.

### query.whereNotIn()

*Sets an `where...not in...` clause for the SQL statement.*

This method is similar to [query.whereIn()](#query_whereIn), please check the 
documentation above.

### query.orWhereNotIn()

*Sets an `where...or...not in...` clause for the SQL statement.*

This method is similar to [query.whereIn()](#query_whereIn), please check the 
documentation above.

### query.whereNull()

*Sets a `where...is null` clause for the SQL statement.*

**signatures:**

- `whereNull(field: string): this`

```javascript
var query = new Query("users");

query.whereNull("email"); // where `email` is null;
```

### query.orWhereNull()

*Sets a `where...or...is null` clause for the SQL statement.*

This method is similar to [query.whereNull()](#query_whereNull), please check 
the documentation above.

### query.whereNotNull()

*Sets a `where...is not null` clause for the SQL statement.*

This method is similar to [query.whereNull()](#query_whereNull), please check 
the documentation above.

### query.orWhereNotNull()

*Sets a `where...or...is not null` clause for the SQL statement.*

This method is similar to [query.whereNull()](#query_whereNull), please check 
the documentation above.

### query.whereExists()

*Sets a `where exists...` clause for the SQL statement.*

**signatures:**

- `whereExists(nested: (query: Query) => void): this`

```javascript
var query = new Query("users");

query.whereExists(_query=>{
    // _query is a new query instance.
    _query.select("*").from("users").where("id", 1);
}); // where exists (select * from `users` where `id` = 1);
```

### query.orWhereExists()

*Sets an `where...or exists...` clause for the SQL statement.*

This method is similar to [query.whereExists()](#query_whereExists), please 
check the documentation above.

### query.whereNotExists()

*Sets an `where not exists...` clause for the SQL statement.*

This method is similar to [query.whereExists()](#query_whereExists), please 
check the documentation above.

### query.orWhereNotExists()

*Sets an `where...or not exists...` clause for the SQL statement.*

This method is similar to [query.whereExists()](#query_whereExists), please 
check the documentation above.

### query.join()

*Sets a `inner join...` clause for the SQL statement.*

**signatures:**

- `join(table: string, field1: string, field2: string): this`
- `join(table: string, field1: string, operator: string, field2: string): this`

```javascript
var query = new Query("users");

query.join("roles", "user.id", "role.user_id");

query.join("roles", "user.id", "=", "role.user_id");

query.join("roles", {"user.id": "role.user_id"});
// select * from `users` inner join `roles` on `user`.`id` = `role`.`user_id`;
```

### query.leftJoin()

*Sets a `left join...` clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.rightJoin()

*Sets a `right join...` clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.fullJoin()

*Sets a `full join...` clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.crossJoin()

*Sets a `cross join...` clause for the SQL statement.*

This method is similar to [query.join()](#query_join), please check the 
documentation above.

### query.orderBy()

*Sets an `order by...` clause for the SQL statement.*

**signatures:**

- `orderBy(field: string, sequence?: "asc" | "desc"): this`

```javascript
var query = new Query("users");

query.orderBy("id", "desc");
// You can set multiple order-bys as well.
query.orderBy("name");
// This will be: select * from `users` order by `id` desc, `name`;
```

### query.random()

*Sets that the records will be ordered in random sequence.*

**signatures:**

- `random(): this`

```javascript
var query = new Query("users");

query.random();
// In MySQL: order by rand();
// In PostgreSQL: order by random();
```

### query.groupBy()

*Sets a `group by...` clause for the SQL statement.*

**signatures:**

- `groupBy(...fields: string[]): this`
- `groupBy(fields: string[]): this`

```javascript
var query = new Query("users");

query.groupBy("name"); // Pass one field.
query.groupBy("name", "email"); // Pass two fields.
query.groupBy(["name", "email"]); // Pass an array.
```

### query.having()

*Sets a `having...` clause for the SQL statement.*

**signatures:**

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

*Sets a `limit...` clause for the SQL statement.*

**signatures:**

- `limit(length: number, offset?: number): this`

```javascript
var query = new Query("users");

query.limit(10); // select * from `users` limit 10;
// Or:
query.limit(10, 5); // select * from `users` limit 5, 10;
```

Although some database like `mssql`, `oracledb`, `db2` doesn't support `limit` 
clause, you can still use this method, the adapters will transfer it to a 
properly statement.

### query.distinct()

*Sets a `distinct` condition to get unique results in a select statement.*

**signatures:**

- `distinct(): this`

```javascript
var query = new Query("users");

query.select("name").distinct(); //select distinct `name` from `users`;
```

### query.union()

*Unites two SQL statements into one.*

**signatures:**

- `union(query: string | Query, all?: boolean): this`
    - `all` Use `union all` to concatenate results.

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

**signatures:**

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

// Also possible to pass an array, but you have to pass all values for all 
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

**signatures:**

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

*Increases a specified field with a specified number.*

**signatures:**

- `increase(field: string, step?: number): Promise<this>`
- `increase(fields: { [field: string]: number }): Promise<this>`

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

*Decreases a specified field with a specified number.*

**signatures:**

- `decrease(field: string, step?: number): Promise<this>`
- `decrease(fields: { [field: string]: number }): Promise<this>`

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

**signatures:**

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

*Gets a record from the database.*

**signatures:**

- `get(): Promise<{ [field: string]: any }>`

```javascript
var query = new Query("users");

query.where("id", 1).get().then(data=>{
    console.log(data);
}).catch(err=>{
    console.log(err);
});
```

### query.all()

*Gets all records from the database.*

**signatures:**

- `all(): Promise<any[]>`

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

**signatures:**

- `count(field?: string): Promise<number>`

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

**signatures:**

- `max(field: string): Promise<number>`

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

**signatures:**

- `min(field: string): Promise<number>`

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

**signatures:**

- `avg(field: string): Promise<number>`

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

**signatures:**

- `sum(field: string): Promise<number>`

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

**signatures:**

- `chunk(length: number, cb: (data: any[]) => false | void): Promise<any[]>`

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

**signatures:**

- `paginate(page: number, length?: number): Promise<PaginatedRecords>`
    - `length` The top limit of per page, default is `10`. Also you can call 
        `query.limit()` to specify a length before calling this method.

Interface `PaginatedRecords` includes:

- `page: number` The current page.
- `limit: number` The top limit of per page.
- `pages: number` A number of all record pages.
- `total: number` A number of all record counts.
- `data: any[]` An array that carries all fetched data.

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

**signatures:**

- `getSelectSQL(): string`

```javascript
var query = new Query("users");
var sql = query.select("*").where("id", 1).getSelectSQL();
console.log(sql);
// select * `users` where `id` = 1
```