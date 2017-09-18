### query.getSelectSQL()

*Generates a select statement.*

**return:**

The select statement.

```javascript
var query = new Query("users");
var sql = query.select("*").where("id", 1).getSelectSQL();
console.log(sql);
//select * `users` where `id` = 1
```