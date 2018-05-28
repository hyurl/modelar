var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.from()", function () {
    describe("from(table: string)", function () {
        it("should generate SQL that selects from one table", function () {
            var query = new Query().select("*").from("users").where("id", 1);
            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });

    describe("from(tables: string[])", function () {
        it("should generate SQL that selects from several tables", function () {
            var query = new Query();
            query.select("*").from(["users", "articles"])
                .where("users.id", query.field("article.user_id"))
                .where("users.id", 1);
            assert.equal(query.getSelectSQL(), "select * from `users`, `articles` where `users`.`id` = `article`.`user_id` and `users`.`id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });

    describe("from(tables: string[])", function () {
        it("should generate SQL that selects from several tables via rest arguments", function () {
            var query = new Query();
            query.select("*").from("users", "articles")
                .where("users.id", query.field("article.user_id"))
                .where("users.id", 1);
            assert.equal(query.getSelectSQL(), "select * from `users`, `articles` where `users`.`id` = `article`.`user_id` and `users`.`id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });
});