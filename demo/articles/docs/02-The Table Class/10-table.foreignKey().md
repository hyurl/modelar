### table.foreignKey()

*Sets a foreign key constraint of the current field.*

**parameters:**

- `table` A table where the the foreign key is in, it is also possible to pass
    this argument an object that sets all the information of the constraint.
- `[field]` A field in the foreign table that related to the current field.
- `[onUpdate]` An action triggered when the record is updated. optional values
    are: 
    - `no action`
    - `set null`
    - `cascade`
    - `restrict`
- `[onDelete]` An action triggered when the record is deleted. optional values
    are:
    - `no action`
    - `set null`
    - `cascade`
    - `restrict`

**return:**

Returns the current instance for function chaining.

```javascript
var table = new Table("users");

table.addColumn("level_id", "integer")
     .foreignKey("level", "id", "no action", "no action");

//Or pass an object as the argument.
table.addColumn("level_id", "integer")
     .foreignKey({
         table: "level",
         field: "id",
         onUpdate: "no action",
         onDelete: "no action",
     });
```