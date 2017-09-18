### query.orderBy()

*Sets a order by... clause for the SQL statement.*

**parameters:**

- `field` A field name in the table that currently binds to.
- `[sequence]` The way of how records ordered, it could be either `asc` or 
    `desc`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.orderBy("id", "desc");
//You can set multiple order-bys as well.
query.orderBy("name"); //sequence is optional.
//This will be: select * from `users` order by `id` desc, `name`;
```