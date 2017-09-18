### query.whereNull()

*Sets a where...is null clause for the SQL statement.*

**parameters:**

- `field` A field name in the table that currently binds to.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.whereNull("email"); //where `email` is null;
```