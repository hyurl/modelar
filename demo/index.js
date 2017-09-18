const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.Server(app);
// const io = require('socket.io')(server);
const open = require("open");
const version = require("../package.json").version;

const DB = require("../DB");

global.User = require("../User");
global.fs = require("fs");
global.router = express.Router();

global.getMarkdownAnchor = (text) => {
    return text.toLowerCase().replace(/\s/g, '-')
        .match(/[\-0-9a-zA-Z]+/g).join("");
}

var view = (tplName, vars = {}) => {
    var content = fs.readFileSync("./tpls/" + tplName + ".html", "utf8");
    for (let i in vars) {
        content = content.replace("{" + i + "}", vars[i]);
    }
    return content;
};

//Handle static resources.
app.use(express.static("public"));

//Parse request body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Parse Cookies.
app.use(cookieParser());
//Handle Sessions.
app.use(session({
    secret: "modelar",
    name: "modelar-id",
    // cookie: {
    //     maxAge: 1000 * 60 * 60 * 2,
    // },
    resave: false,
    saveUninitialized: true,
}));

//Define an Express middleware to store the connection for each request.
app.use((req, res, next) => {
    //Make a connection to the database.
    req.db = new DB("./modelar.db");

    //Add an event handler that when the response has been sent, recycle the 
    //database connection and wait for the next request to use it.
    res.on("finish", () => {
        req.db.recycle();
    });

    /** Shows the content of a template, and replaces its variables. */
    res.view = (tplName, vars = {}) => {
        return view(tplName, vars);
    };

    /** Shows the template and place it in a layout. */
    res.layoutView = (tplName, vars = {}) => {
        var animation = req.url === "/" ? "vivify popInTop" : "";
        if (req.session.UID) {
            User.use(req.db).get(req.session.UID).then(user => {
                return view("layout", {
                    header: view("header", {
                        animation,
                        title: "Modelar",
                        login: view("header/user", {
                            username: user.name,
                        }),
                    }),
                    footer: view("footer", {
                        year: (new Date).getFullYear(),
                        version,
                    }),
                    content: view(tplName, vars),
                });
            }).then(html => {
                res.send(html);
            }).catch(err => {
                res.send(layout(tplName, vars));
            });
        } else {
            res.send(view("layout", {
                header: view("header", {
                    animation,
                    title: "Modelar",
                    login: view("header/login"),
                }),
                footer: view("footer", {
                    year: (new Date).getFullYear(),
                    version,
                }),
                content: view(tplName, vars),
            }));
        }
    };
    next();
});

//Handle routes.
app.use("/", require("./routes")(router));

//Start HTTP server, listening 3000.
server.listen(3000, () => {
    var host = "127.0.0.1";
    var port = server.address().port;

    console.log("Server started, please visit http://%s:%s.", host, port);

    //Open Chrome automatically.
    open("http://" + host + ":" + port, "chrome");
});

//This variable is used to store database connections for socket clients.
// const connections = {};

// //Start WebSocket Server.
// io.on('connection', function(socket) {
//     if (connections[socket.id] === undefined) {
//         connections[socket.id] = new DB("./modelar.db");
//     }
//     socket.emit("news", ["Hello, World!"]);
//     socket.on("get-user", data => {
//         User.use(connections[socket.id]).get(data.UID).then(user => {
//             socket.emit("get-user", user);
//         });
//     });
// });