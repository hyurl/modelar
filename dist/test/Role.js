"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Role.prototype, "id", void 0);
__decorate([
    modelar_1.field("varchar", 32)
], Role.prototype, "name", void 0);
exports.Role = Role;
//# sourceMappingURL=Role.js.map