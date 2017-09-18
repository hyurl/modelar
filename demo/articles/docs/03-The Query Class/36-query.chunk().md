### query.chunk()

*Processes chunked data with a specified length.*

**parameters:**

- `langth` The top limit of how many records that each chunk will carry.
- `callback` A function for processing every chunked data, the only argument 
    passed to it is the data that current chunk carries. If the callback 
    returns `false`, stop chunking.

**return:**

Returns a Promise, and the only argument passed to the callback of `then()` is 
the last chunk of data.

This method walks through all the records that suit the SQL statement. if you 
want to stop it manually, just return `false` in the callback function.

```javascript
var query = new Query("users");

query.chunk(10, data=>{
    //data is an array that carries all the records.
    console.log(data);
}).then(data=>{
    //This data is the last chunked data.
}).catch(err=>{
    console.log(err);
});
```