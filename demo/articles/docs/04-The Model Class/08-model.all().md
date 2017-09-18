### model.all()

*Gets all models from the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is all the fetched models carried in an array.

This method will throw an error if no model was found.

```javascript
const User = require("modelar/User");

var user = new User;
user.all().then(users=>{
    //The users is an array that carries all user models.
    for(let _user of users){
        console.log(_user);
    }
}).catch(err=>{
    console.log(err);
})
```