import { DB, DBConfig } from "modelar";

DB.on("query", (db) => {
    console.log(db.sql, db.bindings, "\n");
});

export var config: DBConfig = {
    type: "mysql", // Could be 'mysql', 'maria' or 'postgres'.
    database: "modelar",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "161301"
}

export var db: DB = new DB(config);