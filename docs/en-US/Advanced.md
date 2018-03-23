In this article, I'm going to give you some tricky but useful demos to 
deepen your thoughts of Modelar.

### Getting Parent and Children Models

This feature is done by the [model.has()](/Docs/TheModelClass#model_has) and 
[model.belongsTo()](/Docs/TheModelClass#model_belongsTo).

```javascript
const { DB, Model } = require("modelar");

DB.init({
    type: "sqlite",
    database: "./modelar.db",
});

var db = new DB;

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            // Set a `parent_id` in the model's fields.
            fields: ["id", "name", "email", "password", "parent_id"],
            searchable: ["name", "email"]
        });
    }

    get parent() {
        // Pass the current class as the associated model class, and pass the
        // `parent_id` as the foreign key.
        return this.belongsTo(User, "parent_id");
    }

    get children() {
        return this.has(User, "parent_id");
    }
}

// Get the user of which ID is 1.
User.use(db).get(1).then(user => {
    // Print out the user's data.
    console.log(user.valueOf());

    // Get all user's children.
    user.children.all().then(children => {
        // Print out all children's data.
        for (let child of children) {
            console.log(child.valueOf());
        }
    });
});

// Get the user of which ID is 2.
User.use(db).get(2).then(user => {
    console.log(user.valueOf());

    // Get the user's parent.
    user.parent.get().then(parent => {
        console.log(parent.valueOf());
    });
});
```

### Using Modelar in Socket.io

This example shows you how to dealing Modelar with Socket.io. For convenience,
I'd create a new database connection for each client, and store all 
connections in a variable each one by their socket IDs. When using Modelar to 
get data from database, retrieve the connection from this variable.

On server side, we do:

```javascript
// This program use Express as well.
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { DB, User } = require("modelar");

// This variable is used to store database connections for socket clients.
const connections = {};

DB.init({
    type: "sqlite",
    database: "./modelar.db",
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Start HTTP server, listening 3000.
server.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s.", host, port);
});

// Start WebSocket Server.
io.on('connection', function(socket) {
    if (connections[socket.id] === undefined) {
        connections[socket.id] = new DB;
    }
    socket.on("disconnect", reason => {
        // Recycle the database connection when the socket is closed.
        connections[socket.id].recycle();
    });
    socket.emit("news", "Hello, World!");
    socket.on("get-user", data => {
        User.use(connections[socket.id]).get(data.UID).then(user => {
            // Send the user to the client.
            socket.emit("get-user", user);
        });
    });
});
```

On client side (index.html), we do:

```javascript
// Must inpormt socket.io first.
var socket = io('http://127.0.0.1:3000');

socket.on('get-user', function(user) {
    // Print out the user data in the browser console.
    console.log(user);
});
socket.on("news", function(data) {
    console.log(data);
    // Send a request with a UID to the server.
    socket.emit("get-user", { UID: 1 });
});
```

### Using Async/Await or Co with Modelar

Since Node.js 7.6.0, you can use `async/await` to handle asynchronous 
operations, before that, you can optionally use `co` module instead.

```javascript
const { User } = require("modelar");

User.init({
    type: "mysql",
    database: "test",
    host: "localhost",
    port: 3306,
    user: "root",
    password: ""
});

// Using async/await
(async() => {
    var user = await User.get(1);
    console.log(user);
    user.close();
})();

// If you are using co, it would be like this:
const co = require("co");

co(function*() {
    var user = yield User.get(1);
    console.log(user);
    user.close();
});
```

### Modelar with TypeScript

Since 3.x, Modelar now is written with TypeScript, although you can still use 
it in JavaScript way, but it would be more convenient if you use it with 
TypeScript, and more features you will get.

In this lesion, I will give you a brief introduction of how to use Modelar 
with TypeScript and **decorators**.

```typescript
import { Model, User, field, primary, searchable } from "modelar";

export class Article extends Model {
    table = "articles";

    @field
    @primary
    id: string;

    @field
    @searchable
    title: string;

    @field
    content: string;

    @field
    user_id: number;

    get user() {
        return <User>this.belongsTo(User, "user_id");
    }
}
```