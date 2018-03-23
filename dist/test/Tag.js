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
const Article_1 = require("./Article");
class Tag extends modelar_1.Model {
    constructor() {
        super(...arguments);
        this.table = "tags";
    }
    get users() {
        return this.belongsToVia(User_1.User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
    get articles() {
        return this.belongsToVia(Article_1.Article, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}
__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Tag.prototype, "id", void 0);
__decorate([
    modelar_1.field("varchar", 32)
], Tag.prototype, "name", void 0);
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map