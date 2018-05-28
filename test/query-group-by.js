var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.groupBy()", function () {
    describe("groupBy(fields: string[])", function () {
        it("should generate SQL with a group by clause via an array argument of strings", function () {
            var query = new Query("users").select("*").groupBy(["name", "email"]);
            assert.equal(query.getSelectSQL(), "select * from `users` group by `name`, `email`");
        });
    });

    describe("groupBy(...fields: string[])", function () {
        it("should generate SQL with a group by clause via rest arguments of strings", function () {
            var query = new Query("users").select("*").groupBy("name", "email");
            assert.equal(query.getSelectSQL(), "select * from `users` group by `name`, `email`");
        });
    });
});

describe("Query.prototype.having()", function () {
    it("should generate SQL with a group by and a having clause", function () {
        var query = new Query("users").select("*").groupBy("name", "email").having("`id` > 1");
        assert.equal(query.getSelectSQL(), "select * from `users` group by `name`, `email` having `id` > 1");
    });
});