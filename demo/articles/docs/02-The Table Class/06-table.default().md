### table.default()

*Sets a default value for the current field.*

**parameters:**

- `value` The default value.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

//Set an empty string as default.
table.addColumn("name", "varchar", 25).default("");
```