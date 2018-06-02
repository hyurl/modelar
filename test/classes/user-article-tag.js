"use strict";

var Model = require("../../").default;

class User extends Model {
    constructor(data) {
        super(data, {
            table: "users2",
            primary: "id",
            fields: ["id", "name", "email"]
        });
    }

    get article() {
        return this.has(Article, "user_id");
    }

    get tag() {
        return this.has(Tag, "taggable_id", "type");
    }
}
exports.User = User;

class Article extends Model {
    constructor(data) {
        super(data, {
            table: "articles2",
            primary: "id",
            fields: ["id", "title", "content", "user_id"],
            searchable: ["title"]
        });
    }

    get user() {
        return this.belongsTo(User, "user_id");
    }

    get tag() {
        return this.has(Tag, "taggable_id", "type");
    }
}
exports.Article = Article;

class Tag extends Model {
    constructor(data) {
        super(data, {
            table: "tags2",
            primary: "id",
            fields: ["id", "name", "taggable_id", "type"]
        });
    }

    get users() {
        return this.belongsTo(User, "taggable_id", "type");
    }

    get articles() {
        return this.belongsTo(Article, "taggable_id", "type");
    }
}
exports.Tag = Tag;