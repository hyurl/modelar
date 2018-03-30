"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const modelar_1 = require("modelar");
const User_1 = require("./User");
class Role extends modelar_1.Model {
    constructor() {
        super(...arguments);
        this.table = "roles";
    }
    get users() {
        return this.belongsToVia(User_1.User, "userroles", "role_id", "user_id");
    }
}
tslib_1.__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Role.prototype, "id", void 0);
tslib_1.__decorate([
    modelar_1.field("varchar", 32)
], Role.prototype, "name", void 0);
exports.Role = Role;
//# sourceMappingURL=Role.js.map