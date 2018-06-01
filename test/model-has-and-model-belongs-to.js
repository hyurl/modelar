"use strict";

var assert = require("assert");
var Model = require("../").default;
var DB = require("../").DB;
var config = require("./config/db");
var co = require("co");

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

describe("Model.prototype.has() & Model.prototype.belongsTo()", function () {
    it("should create model associations as expected", function (done) {
        var db = new DB(config);

        co(function* () {
            var user = new User({ name: "Ayon Lee", email: "i@hyurl.com" });
            yield user.use(db).save();

            var data1 = {
                title: "A Test Article",
                content: "Hello, World!",
                user_id: user.id
            };
            var data2 = {
                title: "Another Test Article",
                content: "Hello, World!",
                user_id: user.id
            };

            var article1 = new Article(data1);
            var article2 = new Article(data2);

            yield article1.use(db).save();
            yield article2.use(db).save();

            /** @type {Article} */
            var article = yield user.article.get();
            assert.equal(article.sql, "select * from `articles2` where `user_id` = ? limit 1");
            assert.deepStrictEqual(article.bindings, [user.id]);
            assert.equal(article.constructor.name, "Article");
            assert.deepStrictEqual(article.data, Object.assign({}, data1, {
                id: article1.id
            }));

            /** @type {Article} */
            var _article = user.article;
            /** @type {Article[]} */
            var articles = yield _article.all();
            assert.equal(_article.sql, "select * from `articles2` where `user_id` = ?");
            assert.deepStrictEqual(_article.bindings, [user.id]);

            for (var i in articles) {
                assert.equal(articles[i].constructor.name, "Article");
                assert.deepStrictEqual(articles[i].data, Object.assign({}, i == "0" ? data1 : data2, {
                    id: i == "0" ? article1.id : article2.id
                }));
            }

            /** @type {User} */
            var _user = yield article1.user.get();
            assert.equal(_user.sql, "select * from `users2` where `id` = ? limit 1");
            assert.deepStrictEqual(_user.bindings, [article1.user_id]);
            assert.equal(_user.constructor.name, "User");
            assert.deepStrictEqual(_user.data, {
                id: article1.user_id,
                name: "Ayon Lee",
                email: "i@hyurl.com"
            });

            var tag1 = new Tag({
                name: "admin",
                taggable_id: user.id,
                type: User.name
            });
            var tag2 = new Tag({
                name: "test",
                taggable_id: article1.id,
                type: Article.name
            });
            
            yield tag1.use(db).save();
            yield tag2.use(db).save();

            /** @type {Tag} */
            var userTag = yield user.tag.get();
            var articleTag = article.tag;
            /** @type {Tag[]} */
            var articleTags = yield articleTag.all();

            assert.equal(userTag.sql, "select * from `tags2` where `taggable_id` = ? and `type` = ? limit 1");
            assert.deepStrictEqual(userTag.bindings, [user.id, "User"]);
            assert.equal(articleTag.sql, "select * from `tags2` where `taggable_id` = ? and `type` = ?");
            assert.deepStrictEqual(articleTag.bindings, [article1.id, "Article"]);
            assert.equal(userTag.constructor.name, "Tag");
            assert.deepStrictEqual(userTag.data, {
                id: userTag.id,
                name: "admin",
                taggable_id: user.id,
                type: "User"
            });
            assert.equal(articleTags[0].name, "test");
            assert.strictEqual(articleTags[0].taggable_id, article1.id);
            assert.equal(articleTags[0].type, "Article");

            /** @type {User} */
            var user2 = yield userTag.users.get();
            assert.equal(user2.sql, "select * from `users2` where `id` = ? limit 1");
            assert.deepStrictEqual(user2.bindings, [userTag.taggable_id]);
            assert.deepStrictEqual(user2.data, user.data);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});