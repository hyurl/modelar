### query.having()

*Sets a having clause for the SQL statement.*

**return:**

- `raw` A SQL clause to define comparing conditions.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select("name", "sum(money)")
     .where("name", "hyurl")
     .groupBy("name")
     .having("sum(money) > 200");
//select `name`, sum(money) from `users` where `name` = 'hyurl' group by 
//`name` baving(money) > 20;
```