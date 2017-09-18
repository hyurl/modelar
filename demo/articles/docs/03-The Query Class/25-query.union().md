### query.union()

*Unites two SQL statements into one.*

**parameters:**

- `query` Could be a SQL statement, or a Query instance.
- `[all]` Use `union all` to concatenate results, default is `false`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.union("select * from `roles`");

//Or pass another Query instance.
var query2 = new Query("roles");
query.union(query2);

//Union all:
query.union(query2, true);
```