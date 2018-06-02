"use strict";

var Model = require("../../").default;
var _Article = require("./user-article-tag").Article;

class Region extends Model {
    constructor(data) {
        super(data, {
            table: "regions",
            primary: "id",
            fields: ["id", "name"]
        });
    }

    get article() {
        return this.hasThrough(Article, User, "user_id", "region_id");
    }
}
exports.Region = Region;

class User extends Model {
    constructor(data) {
        super(data, {
            table: "users3",
            primary: "id",
            fields: ["id", "name", "email", "region_id"]
        });
    }
}
exports.User = User;

class Article extends _Article {
    constructor(data) {
        super(data);
        this.table = "articles3";
    }

    get region() {
        return this.belongsToThrough(Region, User, "user_id", "region_id");
    }
}
exports.Article = Article;