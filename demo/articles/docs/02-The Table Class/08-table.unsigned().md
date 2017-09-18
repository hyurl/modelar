### table.unsigned()

*Sets the column to be unsigned.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("level", "integer").unsigned();
```