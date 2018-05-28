const { DB, DBConfig } = require("modelar");
const { IbmdbAdapter } = require("modelar-jt400-adapter");

DB.setAdapter("ibmdb", IbmdbAdapter);

DB.on("query", (db) => {
    console.log(db.sql, db.bindings, "\n");
});

module.exports = new DB({
    type: "ibmdb",
    // database: "SAMPLE",
    host: "localhost",
    // port: 50000,
    user: "db2admin",
    password: ""
});