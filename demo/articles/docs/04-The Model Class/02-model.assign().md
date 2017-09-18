### model.assign()

*Assigns data to the model instance.*

**parameters:**

- `data` The data in a object needs to be assigned.
- `[useSetter]` Use setters (if any) to process the data, default is `false`.

**return:**

Returns the current instance for function chaining.

```javascript
//Generally, there are there ways to put data in a model.
//Since User extends the Model, I will use it as an example.
//First, pass the data when instantiate:
var user = new User({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});

//Second, through pseudo-properties:
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";

//Third, call assign():
user.assign({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});

//The former two will automatically trigger user-defined setters, while the 
//third one will not, if you want it to, you must pass the second argument a 
//`true` to assign(), like this:
user.assign({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
}, true);

//Another difference is that the former tow cannot set data of the primary 
//key, while assign() can. But this is only helpful when you get those data 
//from the database and want to put them in the model, which is the Model 
//internally does, otherwise it just make problems.

user.assign({
    id: 1,
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});
```