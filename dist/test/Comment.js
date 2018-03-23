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
class Comment extends modelar_1.Model {
    constructor() {
        super(...arguments);
        this.table = "comments";
    }
    get user() {
        return this.belongsTo(User_1.User, "commentable_id", "commentable_type");
    }
    get article() {
        return this.belongsTo(Article_1.Article, "commentable_id", "commentable_type");
    }
}
__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Comment.prototype, "id", void 0);
__decorate([
    modelar_1.field("varchar", 1024),
    modelar_1.defaultValue("")
], Comment.prototype, "content", void 0);
__decorate([
    modelar_1.field("int")
], Comment.prototype, "commentable_id", void 0);
__decorate([
    modelar_1.field("varchar", 32)
], Comment.prototype, "commentable_type", void 0);
exports.Comment = Comment;
//# sourceMappingURL=Comment.js.map