"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const modelar_1 = require("modelar");
const Article_1 = require("./Article");
const Comment_1 = require("./Comment");
const Country_1 = require("./Country");
const Role_1 = require("./Role");
const Tag_1 = require("./Tag");
class User extends modelar_1.User {
    get country() {
        return this.belongsTo(Country_1.Country, "country_id");
    }
    get roles() {
        return this.hasVia(Role_1.Role, "userroles", "role_id", "user_id").withPivot("activated");
    }
    get tags() {
        return this.hasVia(Tag_1.Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
    get articles() {
        return this.has(Article_1.Article, "user_id");
    }
    get comments() {
        return this.has(Comment_1.Comment, "commentable_id", "commentable_type");
    }
}
__decorate([
    modelar_1.field("int")
], User.prototype, "country_id", void 0);
exports.User = User;
//# sourceMappingURL=User.js.map