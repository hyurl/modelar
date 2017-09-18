### query.insert()

*Inserts a new record into the database.*

**parameters:**

- `data` An object that carries fields and their values, or pass all values in
    an array that fulfil all the fields.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
var query = new Query("users");

query.insert({
    name: 'hyurl',
    email: "i@hyurl.com",
}).then(query=>{
    console.log("A new user has been inserted.");
}).catch(err=>{
    console.log(err);
});

//Also possible to pass an array, but you have to pass the values of all the 
//fields.
query.insert([
    1, //id
    "hyurl", //name
    "i@hyurl.com", //email
    "123456", //password
]).then(query=>{
    console.log("A new user has been inserted.");
}).catch(err=>{
    console.log(err);
});
```