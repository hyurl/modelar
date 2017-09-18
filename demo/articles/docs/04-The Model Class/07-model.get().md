### model.get()

*Gets a model from the database.*

**parameters:**

- `[id]` The value of the model's primary key.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the fetched model.

This method will throw an error if no model was found.

```javascript
const User = require("modelar/User");

var user = new User;
user.where("id", 1).get().then(user=>{
    console.log(user);
}).then(err=>{
    console.log(err);
})

//Alternatively, you can just do:
user.get(1).then(user=>{
    console.log(user);
});
```