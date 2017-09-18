### query.all()

*Gets all records from the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is all the fetched data carried in an array.

```javascript
var query = new Query("users");

query.all().then(data=>{
    console.log(data); //The data will be an array that carries all records.
}).catch(err=>{
    console.log(err);
});
```