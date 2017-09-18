### model.update()

*Updates the current model.*

**parameters:**

- `data` An object that carries fields and their values.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const User = require("modelar/User");

var user = new User;
user.get(1).then(user=>{
    return user.update({
        name: "hyurl",
        email: "i@hyurl.com",
    });
}).then(user=>{
    console.log("User has been updated.");
}).catch(err=>{
    console.log(err);
});
```