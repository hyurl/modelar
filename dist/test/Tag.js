"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
tslib_1.__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Tag.prototype, "id", void 0);
tslib_1.__decorate([
    modelar_1.field("varchar", 32)
], Tag.prototype, "name", void 0);
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map