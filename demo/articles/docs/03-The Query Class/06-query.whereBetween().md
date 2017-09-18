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

query.whereBetween("id", [1, 10]); //where `id` between 1 and 10;
```