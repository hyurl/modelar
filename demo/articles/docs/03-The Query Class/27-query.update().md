### query.update()

*Updates an existing record.*

**parameters:**

- `data` An object that carries fields and their values.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var query = new Query("users");

query.where("id", 1).update({
    name: "hyurl",
    email: "i@hyurl.com",
}).then(query=>{
    console.log("The user has been updated.");
}).catch(err=>{
    console.log(err);
});
```