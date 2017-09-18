### query.get()

*Gets a record from the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the fetched data.

```javascript
var query = new Query("users");

query.where("id", 1).get().then(data=>{
    console.log(data); //The data will be an object that carries the record.
}).catch(err=>{
    console.log(err);
});
```