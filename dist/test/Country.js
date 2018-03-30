"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const modelar_1 = require("modelar");
const Article_1 = require("./Article");
const User_1 = require("./User");
class Country extends modelar_1.Model {
    constructor() {
        super(...arguments);
        this.table = "countries";
    }
    get users() {
        return this.has(User_1.User, "country_id");
    }
    get articles() {
        return this.hasThrough(Article_1.Article, User_1.User, "user_id", "country_id");
    }
}
tslib_1.__decorate([
    modelar_1.field,
    modelar_1.primary,
    modelar_1.autoIncrement
], Country.prototype, "id", void 0);
tslib_1.__decorate([
    modelar_1.field("varchar", 32)
], Country.prototype, "name", void 0);
exports.Country = Country;
//# sourceMappingURL=Country.js.map