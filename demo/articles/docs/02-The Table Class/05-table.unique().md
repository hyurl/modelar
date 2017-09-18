### table.unique()

*Sets the current field's value to be unique.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", [3, 15]).unique();
```