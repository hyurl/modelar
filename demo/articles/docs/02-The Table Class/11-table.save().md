### table.save()

*Saves the table, this method actually creates a new table in the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var table = new Table("users");

//Do stuffs here...

table.save().then(table=>{
    console.log(table.sql);
    //The sql property carries the sql statement that creates the table (DDL).
}).catch(err=>{
    console.log(err);
});
```