"use strict";

var Model = require("../../").default;

class User extends Model {
    constructor(data) {
        super(data, {
            table: "users4",
            primary: "id",
            fields: ["id", "name", "email"]
        });
    }

    get roles() {
        return this.hasVia(Role, "user_role", "role_id", "user_id");
    }
}
exports.User = User;

class Role extends Model {
    constructor(data) {
        super(data, {
            table: "roles4",
            primary: "id",
            fields: ["id", "name"]
        });
    }

    get users() {
        return this.belongsToVia(User, "user_role", "role_id", "user_id");
    }
}
exports.Role = Role;