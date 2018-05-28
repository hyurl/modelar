var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.where()", function () {
    describe("where(field: string, value: string | number | boolean | Date)", function () {
        var query = new Query("users");

        query.select("*");

        it("should generate SQL with one where clause", function () {

            query.where("id", 1);

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });

        it("should generate SQL with two where clauses", function () {
            query.where("name", "Ayon Lee");

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? and `name` = ?");
            assert.deepEqual(query["_bindings"], [1, "Ayon Lee"]);
        });
    });

    describe("where(field: string, operator: string, value: string | number | boolean | Date)", function () {
        var query = new Query("users");

        query.select("*");

        it("should generate SQL with where >", function () {
            query.where("id", ">", 1);

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` > ?");
            assert.deepEqual(query["_bindings"], [1]);
        });

        it("should generate SQL with where <>", function () {
            query.where("name", "<>", "Luna");

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` > ? and `name` <> ?");
            assert.deepEqual(query["_bindings"], [1, "Luna"]);
        });
    });

    describe("where(fields: { [field: string]: string | number | boolean | Date })", function () {
        var query = new Query("users");

        query.select("*");

        it("should generate SQL with where clause that contains multiple equal conditions", function () {
            query.where({
                id: 1,
                name: "Ayon Lee",
                email: "i@hyurl.com"
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? and `name` = ? and `email` = ?");
            assert.deepEqual(query["_bindings"], [1, "Ayon Lee", "i@hyurl.com"]);
        });
    });

    describe("where(nested: (query: Query) => void)", function () {
        var query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where clause", function () {
            query.where("id", 1).where(function (query) {
                query.where("name", "<>", "Luna").where("email", "i@hyurl.com");
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? and (`name` <> ? and `email` = ?)");
            assert.deepEqual(query["_bindings"], [1, "Luna", "i@hyurl.com"]);
        });
    });

    describe("where(field: string, nested: (query: Query) => void)", function () {
        var query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where clause compare to a specific field", function () {
            query.where("id", function (query) {
                query.select("id").from("users").where("name", "Ayon Lee").limit(1);
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = (select `id` from `users` where `name` = ? limit 1)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
        });
    });

    describe("where(field: string, operator: string, nested: (query: Query) => void)", function () {
        var query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where clause compare to a specific field", function () {
            query.where("id", "<>", function (query) {
                query.select("id").from("users").where("name", "Ayon Lee").limit(1);
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` <> (select `id` from `users` where `name` = ? limit 1)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
        });
    });
});