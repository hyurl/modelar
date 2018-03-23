"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("./Role");
const db_1 = require("./db");
exports.createRoles = async () => {
    await new Role_1.Role({
        name: "admin"
    }).use(db_1.db).save();
    await new Role_1.Role({
        name: "editor"
    }).use(db_1.db).save();
    await new Role_1.Role({
        name: "member"
    }).use(db_1.db).save();
};
//# sourceMappingURL=create-roles.js.map