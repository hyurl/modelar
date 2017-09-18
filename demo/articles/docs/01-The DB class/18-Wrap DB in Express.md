### Wrap DB in Express

NodeJS is a single-threaded program, when it comes to multi-clients server 
programing, you cannot tell when and where the state of an static object is 
in place, so you have to create an instance which has its own state instead.

What I'm talking is, a connection to the database must be unique for each 
request in a NodeJS server, even if there can be shared with different 
requests, but only if they are done with one particular request.

In this case, you must create a new DB instance and make connect for each 
request, and pass it through the request. Also, DB provides an internal pool
for connections, when a connection has done its job, it could be recycled and
retrieved by the next request, there for saving the resources and speeding up
the program.

```javascript
const express = require("express");
const app = express();
const DB = require("modelar/DB");
const User = require("modelar/User");

//Define an Express middleware to store the connection for each request.
app.use((req, res, next)=>{
    //Make a connection to the database store it in the req.db property.
    req.db = new DB("./modelar.db");

    //Add an event handler that when the response has been sent, recycle the 
    //database connection and wait for the next request to use it.
    res.on("finish", () => {
        req.db.recycle();
    });

    next();
});

//Define a route to get a user by its UID.
app.get("/user/:id", (req, res)=>{
    //Use the conneciton in the req.db.
    User.use(req.db).get(req.params.id).then(user=>{
        //If user exists and has been fetched, this code block will run.
        res.json({
            success: true,
            data: user.valueOf(),
        });
    }).catch(err=>{
        //If user doesn't exist or other errors occured, this code block runs.
        res.json({
            success: false,
            msg: err.message,
        });
    });
});

//Start server, listening 3000.
var server = app.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s", host, port);
});
```

This is just an example for Express, if you're using other framework, say 
`Socket.io`, they are pretty much the same, just wrap the DB in their function
scopes, and don't forget to close or recycle connections when the response has
been sent to the client.