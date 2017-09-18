### model.save()

*Saves the current model, if there is not record in the database,* 
*it will be automatically inserted.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const User = require("modelar/User");

var user = new User;
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";
user.save().then(user=>{
    console.log("The user (UID: "+user.id+") is saved.");
}).catch(err=>{
    console.log(err);
});
```