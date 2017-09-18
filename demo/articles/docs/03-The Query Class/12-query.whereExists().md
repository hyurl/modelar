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
    //_query is a new query instance.
    _query.select("*").from("users").where("id", 1);
}); //where exists (select * from `users` where `id` = 1);
```