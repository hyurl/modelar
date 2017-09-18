### query.limit()

*Sets a limit clause for the SQL statement.*

**parameters:**

- `length` The top limit of how many counts that this query will fetch.
- `[offset]` The start point, count from `0`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.limit(10); //select * from `users` limit 10;
//Or
query.limit(10, 5); //select * from `users` limit 5, 10;
```