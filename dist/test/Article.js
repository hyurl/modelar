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
const Comment_1 = require("./Comment");
const Country_1 = require("./Country");
const Tag_1 = require("./Tag");
class Article extends modelar_1.Model {
    constructor() {
        super(...arguments);
        this.table = "articles";
    }
    get user() {
        return this.belongsTo(User_1.User, "user_id");
    }
    get country() {
        return this.belongsToThrough(Country_1.Country, User_1.User, "user_id", "country_id");
    }
    get tags() {
        return this.hasVia(Tag_1.Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
    get comments() {
        // Pass the argument `type` to define a polymorphic association.
        return this.has(Comment_1.Comment, "commentable_id", "commentable_type");
    }
}
__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Article.prototype, "id", void 0);
__decorate([
    modelar_1.field("varchar", 255),
    modelar_1.searchable
], Article.prototype, "title", void 0);
__decorate([
    modelar_1.field("varchar", 1024),
    modelar_1.defaultValue("")
], Article.prototype, "content", void 0);
__decorate([
    modelar_1.field("int"),
    modelar_1.defaultValue(0)
], Article.prototype, "user_id", void 0);
exports.Article = Article;
//# sourceMappingURL=Article.js.map