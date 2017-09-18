### model.insert()

*Inserts the current model as a new record into the database.*

*parameters:*

- `[data]` An object that carries fields and their values.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const User = require("modelar/User");

var user = new User;
user.insert({
    name: "testor",
    email: "testor@localhost",
    password: "12345",
}).then(user=>{
    console.log("User created with UID: "+user.id);
}).catch(err=>{
    console.log(err);
});
```