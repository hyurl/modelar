"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Role_1 = require("./Role");
const db = require("modelar/test/db");
exports.createRoles = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield new Role_1.Role({
        name: "admin"
    }).use(db).save();
    yield new Role_1.Role({
        name: "editor"
    }).use(db).save();
    yield new Role_1.Role({
        name: "member"
    }).use(db).save();
});
//# sourceMappingURL=create-roles.js.map