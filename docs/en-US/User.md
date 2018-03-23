
#### Table of Contents

* [The User Class](#The-User-Class)
    * [Events](#Events)
    * [user.constructor()](#user_constructor)
    * [user.login()](#user_login)
    * [User.login()](#User_login)

## The User Class

*User Model.*

This model is used to manage user data, it provides a login() method that 
allows you sign in the website.

Also, the User class is a very good example of using Modelar, you can see 
its code, learn what it really does with Modelar and try to define you own 
class.

### Events

- `login` Fired when a user logged in.

### user.constructor()

**signatures:**

- `constructor()`
- `constructor(data: { [field: string]: any })`
- `constructor(data: { [field: string]: any }, config: ModelConfig)`

```javascript
var user1 = new User;
var user2 = new User({
    name: "luna",
    email: "luna@hyurl.com"
});

class Member extends User {
    constructor(data = {}) {
        super(data, {
            table: "members",
            fields: ["id", "name", "email", "password", "gender", "age"],
            searchable: ["name", "email"]
        });
    }
}
```

### user.login()

*Tries to sign in a user.*

**signatures:**

- `login(options: { [field: string]: string, user?: string, password: string }): Promise<this>`

By default, `name` and `email` can be used for logging, if none of them are 
provided, a `user` property should be passed, it will try to test all 
possibilities. You can modify the property `User.loginable` to change usable 
fields. This property also honor the principle of hierarchical tree, that 
means if you have a `class Member extrends User{}`, then `Member.loginable` 
will be used first.

```javascript
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const { DB, User } = require("modelar");
const app = express();

// Parse request body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle Sessions.
app.use(session({
    secret: "modelar",
    name: "modelar-id",
    resave: false,
    saveUninitialized: true,
}));

// Define an Express middleware to store the connection for each request.
app.use((req, res, next)=>{
    // Make a connection to the database and store it in the req.db property.
    req.db = new DB();
    
    // Add an event handler that when the response has been sent, recycle the 
    // database connection and wait for the next request to reuse it.
    res.on("finish", () => {
        req.db.recycle();
    });

    next();
});

/** Login a user. */
var doLogin = (req, res)=>{
    User.use(req.db).login(req.body).then(user=>{
        req.session.UID = user.id; // Save the UID in session.
        res.json({
            success: true,
            msg: "User logged in.",
            data: user.valueOf()
        });
    }).catch(err=>{
        res.json({
            success: false,
            msg: err.message,
        });
    });
};

app.post("/login", (req, res)=>{
    if(req.session.UID === undefined){
        // If the user haven't logged in, then do login.
        doLogin(req, res);
    }else{
        // If the user is already logged in, then try to retrieve its data.
        User.use(req.db).get(req.session.UID).then(user=>{
            res.json({
                success: true,
                msg: "User logged in.",
                data: user.valueOf()
            });
        }).catch(err=>{
            doLogin(req, res);
        });
    }
});

app.get("/logout", (req, res)=>{
    delete req.session.UID;
    res.json({
        success: true,
        msg: "User logged out.",
    });
});

// Start server, listening 3000.
var server = app.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s", host, port);
});
```

### User.login()

A short-hand of `(new User).login()`.