### Using Modelar in Socket.io

This example shows you how to dealing Modelar with Socket.io. For convenience,
I'd create a new database connection for each client, and store all 
connections in a variable each one by their socket IDs. When using Modelar to 
get data from database, retrieve the connection from this variable.

On server side, we do:

```javascript
//This program use Express as well.
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const DB = require("modelar/DB");
const User = require("modelar/User");

//This variable is used to store database connections for socket clients.
const connections = {};

DB.init({
    type: "sqlite",
    database: "./modelar.db",
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

//Start HTTP server, listening 3000.
server.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s.", host, port);
});

//Start WebSocket Server.
io.on('connection', function(socket) {
    if (connections[socket.id] === undefined) {
        connections[socket.id] = new DB;
    }
    socket.emit("news", "Hello, World!");
    socket.on("get-user", data => {
        User.use(connections[socket.id]).get(data.UID).then(user => {
            //Send the user to the client.
            socket.emit("get-user", user);
        });
    });
});
```

On client side (index.html), we do:

```javascript
//Must inpormt socket.io first.
var socket = io('http://127.0.0.1:3000');

socket.on('get-user', function(user) {
    //Print out the user data in the browser console.
    console.log(user);
});
socket.on("news", function(data) {
    console.log(data);
    //Send a request with a UID to the server.
    socket.emit("get-user", { UID: 1 });
});
```