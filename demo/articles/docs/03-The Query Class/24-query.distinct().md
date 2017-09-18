### query.distinct()

*Sets a distinct condition to get unique results in a select statement.*

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.select("name").distinct(); //select distinct `name` from `users`;
```