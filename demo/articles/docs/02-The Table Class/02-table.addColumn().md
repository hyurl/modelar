## table.addColumn()

*Adds a column to the table.*

**parameters:**

- `name` The name of the field.
- `type` The type of the field.
- `[length]` The top limit of length that this field can store, also it could 
    be an array carries only two numbers that represents a range between 
    bottom and top.

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

//primary() and autoIncrement() later will be talked about later.
table.addColumn("id", "interger").primary().autoIncrement(); 
//Set the length to be an interval.
table.addColumn("name", "varchar", [3, 15]);
//Only set the maximum length for `email`.
table.addColumn("email", "varchar", 25);
//Add other columns like `password`.
table.addColumn("password", "varchar", 255);

//Save the table, this will actually create a new `users` table in database.
table.save();
```

The Table instance has an internal pointer that points to the current field, 
`addColumn()` will add a new column and move the pointer to it, so that other 
methods like `primary()`, `unique()`, etc., will work on the that field. 
There is not way to move the pointer back or to a particular column, so you 
must call other methods to do stuffs right after calling `addColumn()`.