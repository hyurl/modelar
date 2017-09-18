### table.comment()

*Adds a comment to the current field.*

**parameters:**

- `text` The comment text.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().comment("The primary key.");
```