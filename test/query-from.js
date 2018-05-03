const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.from()", () => {
    describe("from(table: string)", () => {
        it("should generate SQL that selects from one table", () => {
            let query = new Query().select("*").from("users").where("id", 1);
            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });

    describe("from(tables: string[])", () => {
        it("should generate SQL that selects from several tables", () => {
            let query = new Query();
            query.select("*").from(["users", "articles"])
                .where("users.id", query.field("article.user_id"))
                .where("users.id", 1);
            assert.equal(query.getSelectSQL(), "select * from `users`, `articles` where `users`.`id` = `article`.`user_id` and `users`.`id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });

    describe("from(tables: string[])", () => {
        it("should generate SQL that selects from several tables via rest arguments", () => {
            let query = new Query();
            query.select("*").from("users", "articles")
                .where("users.id", query.field("article.user_id"))
                .where("users.id", 1);
            assert.equal(query.getSelectSQL(), "select * from `users`, `articles` where `users`.`id` = `article`.`user_id` and `users`.`id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });
});