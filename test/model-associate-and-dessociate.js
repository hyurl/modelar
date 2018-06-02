var assert = require("assert");
var DB = require("../").DB;
var config = require("./config/db");
var co = require("co");
var User = require("./classes/user-article-tag").User;
var Article = require("./classes/user-article-tag").Article;
var Tag = require("./classes/user-article-tag").Tag;

describe("Model.prototype.associate() & Model.prototype.dissociate()", function () {
    it("should add and remove associations as expected", function (done) {
        var db = new DB(config);

        co(function* () {
            var user = new User({ name: "Ayon Lee", email: "i@hyurl.com" });
            yield user.use(db).save();

            var data = {
                title: "A Test Article",
                content: "Hello, World!",
            };
            var article = new Article(data);

            yield article.use(db).save();
            assert.deepStrictEqual(article.data, Object.assign({}, data, {
                id: article.insertId,
                user_id: null
            }));

            // associate with user id
            var _article = yield article.user.associate(user.id);
            assert.equal(_article, article);
            assert.deepStrictEqual(article.data, Object.assign({}, data, {
                id: article.id,
                user_id: user.id
            }));

            // dissociate id
            _article = yield article.user.dissociate();
            assert.equal(_article, article);
            assert.deepStrictEqual(article.data, Object.assign({}, data, {
                id: article.id,
                user_id: null
            }));

            // update associate with a user instance
            _article = yield article.user.associate(user);
            assert.equal(_article, article);
            assert.deepStrictEqual(article.data, Object.assign({}, data, {
                id: article.id,
                user_id: user.id
            }));

            // test association with type
            var tag = new Tag({ name: "admin" });
            yield tag.use(db).save();
            assert.deepStrictEqual(tag.data, {
                id: tag.id,
                name: "admin",
                type: null,
                taggable_id: null
            });

            var _tag = yield tag.users.associate(user.id);
            assert.equal(_tag, tag);
            assert.deepStrictEqual(tag.data, {
                id: tag.id,
                name: "admin",
                type: "User",
                taggable_id: user.id
            });

            _tag = yield tag.users.dissociate();
            assert.equal(_tag, tag);
            assert.deepStrictEqual(tag.data, {
                id: tag.id,
                name: "admin",
                type: null,
                taggable_id: null
            });
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});