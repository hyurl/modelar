### query.table()

*Sets the table name that the current instance binds to.*

**parameters:**

- `table` The table name.

**return:**

Returns the current instance for function chaining.

**alias:**

- `form()`

```javascript
var query = new Query(); //If you don't pass a table name here,

 //you can binids it here.
query.table("users").select("id", "name", "email");

//you can use its alias, which is more readable in select statements.
query.select("id", "name", "email").form("users");
```