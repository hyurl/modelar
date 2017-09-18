### query.groupBy()

*Sets a group by... clause for the SQL statement.*

**parameters:**

- `field` A list of all target fields, each one passed as an argument. Or just
    pass the first argument as an array that carries all the field names.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.groupBy("name"); //Pass one field.
query.groupBy("name", "email"); //Pass two fields.
query.groupBy(["name", "email"]); //Pass an array.
```