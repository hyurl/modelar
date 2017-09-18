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
//Or just pass an array as its first argument.
query.select(["id", "name", "email"]);
```