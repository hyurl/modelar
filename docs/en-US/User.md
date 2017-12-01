
#### Table of Contents

* [The User Class](#The-User-Class)
    * [user.login()](#user_login)

## The User Class

*User Model.*

This model is used to manage user data, it provides a login() method that 
allows you sign in the website.

Also, the User class is a very good example of using Modelar, you can see 
its code, learn what it really does with Modelar and try to define you own 
class.

### user.login()

*Tries to sign in a user.*

If succeeded, an `login` event will be fired, if failed, throws an error 
indicates the reason. This method won't save user information in session or 
other storage materials, if you want it to, you have to do it yourself.

**parameters:**

- `args` This parameter can carry one or more `loginable` fields and values, 
    and a `password` field must be passed at the same time. If no `loginable` 
    fields are passed, a `user` must be passed, which means trying to match 
    all possibilities automatically.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the user instance which is logged in.

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