### table.notNull()

*Sets the column to be not null.*

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("name", "varchar", 25).default("").notNull();
```