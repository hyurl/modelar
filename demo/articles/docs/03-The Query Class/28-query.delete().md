### query.delete()

*Deletes an existing record.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var query = new Query("users");

query.where("id", 1).delete().then(query=>{
    console.log("The user has been deleted.");
}).catch(err=>{
    console.log(err);
})
```