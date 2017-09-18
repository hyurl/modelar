### query.join()

*Sets a inner join... clause for the SQL statement.*

**parameters:**

- `table` A table name that needs to join with.
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
//Or pass a object
query.join("roles", {"user.id": "role.user_id"});
//select * from `users` inner join `roles` on user.id = role.user_id;
```