const { DB, DBConfig } = require("modelar");

DB.on("query", (db) => {
    console.log(db.sql, db.bindings, "\n");
});

module.exports = new DB({
    type: "mysql", // Could be 'mysql', 'maria' or 'postgres'.
    database: "modelar",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "161301"
});