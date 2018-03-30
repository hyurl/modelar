"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
tslib_1.__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Article.prototype, "id", void 0);
tslib_1.__decorate([
    modelar_1.field("varchar", 255),
    modelar_1.searchable
], Article.prototype, "title", void 0);
tslib_1.__decorate([
    modelar_1.field("varchar", 1024),
    modelar_1.defaultValue("")
], Article.prototype, "content", void 0);
tslib_1.__decorate([
    modelar_1.field("int"),
    modelar_1.defaultValue(0)
], Article.prototype, "user_id", void 0);
exports.Article = Article;
//# sourceMappingURL=Article.js.map