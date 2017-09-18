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

query.whereIn("id", [1, 2, 3, 4]); //where `id` in (1, 2, 3, 4);

//Or pass values as an callback.
query.whereIn("id", _query => {
    //_query is a new query instance.
    _query.select("user_id").from("user_role").where("role_id", 1);
});
//where `id` in (select `user_id` from `user_role` where `role_id` = 1);
```