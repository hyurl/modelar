var assert = require("assert");
var DB = require("../").DB;
var config = require("./config/db");
var co = require("co");
var Region = require("./classes/user-region-article").Region;
var User = require("./classes/user-region-article").User;
var Article = require("./classes/user-region-article").Article;

describe("Model.prototype.hasThrough() & Model.prototype.belongsToThrough()", function () {
    it("should create model associations as expected", function (done) {
        var db = new DB(config);

        co(function* () {
            var region = new Region({ name: "China" });
            yield region.use(db).save();

            var user = new User({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                region_id: region.id
            });
            yield user.use(db).save();
            
            var article = new Article({
                title: "A Test Article",
                content: "Hello, World!"
            });
            yield article.use(db).save();
            yield article.user.associate(user);

            /** @type {Article} */
            var _article = region.article;
            var article1 = yield _article.get();
            assert.equal(_article.sql, "select * from `articles3` where `user_id` in (select `id` from `users3` where `region_id` = ?) limit 1");
            assert.deepStrictEqual(_article.bindings, [region.id]);

            var articles = yield _article.limit(0).all(); // must reset limit since 'get()' sets 'limit 1'.
            assert.equal(_article.sql, "select * from `articles3` where `user_id` in (select `id` from `users3` where `region_id` = ?)");
            assert.deepStrictEqual(_article.bindings, [region.id]);

            assert.deepStrictEqual(articles[0].data, article.data);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
})