### table.autoIncrement()

*Sets the current field to be auto-increment.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("id", "integer").primary().autoIncrement();
```