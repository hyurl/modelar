### table.primary()

*Sets the current field to be the primary key of the table.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

//Call primary() right after adding a column.
table.addColum("id", "integer").primary();
```