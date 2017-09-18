### model.delete()

*Deletes the current model.*

**parameters:**

- `[id]` The value of the model's primary key.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const User = require("modelar/User");

var user = new User;
user.get(1).then(user=>{
    return user.delete();
}).then(user=>{
    console.log("User has been deleted.");
}).catch(err=>{
    console.log(err);
});

//Alternatively, you can just do:
user.delete(1).then(user=>{
    console.log("User has been deleted.");
}).catch(err=>{
    console.log(err);
});
```