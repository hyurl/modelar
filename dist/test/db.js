"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modelar_1 = require("modelar");
modelar_1.DB.on("query", (db) => {
    console.log(db.sql, db.bindings, "\n");
});
exports.config = {
    type: "mysql",
    database: "modelar",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "161301"
};
exports.db = new modelar_1.DB(exports.config);
//# sourceMappingURL=db.js.map