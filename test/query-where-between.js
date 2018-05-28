var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.whereBetween()", function () {
    it("should generate SQL with one where between clause", function () {
        var query = new Query("users");

        query.select("*").whereBetween("id", [1, 10]);

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` between ? and ?");
        assert.deepEqual(query["_bindings"], [1, 10]);
    });
});

describe("Query.prototype.whereNotBetween()", function () {
    it("should generate SQL with one where not between clause", function () {
        var query = new Query("users");

        query.select("*").whereNotBetween("id", [1, 10]);

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` not between ? and ?");
        assert.deepEqual(query["_bindings"], [1, 10]);
    });
});

describe("Query.prototype.orWhereBetween()", function () {
    it("should generate SQL with one where between or between clause", function () {
        var query = new Query("users");

        query.select("*").whereBetween("id", [1, 10]).orWhereBetween("id", [99, 100]);

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` between ? and ? or `id` between ? and ?");
        assert.deepEqual(query["_bindings"], [1, 10, 99, 100]);
    });
});

describe("Query.prototype.orWhereNotBetween()", function () {
    it("should generate SQL with one where between or not between clause", function () {
        var query = new Query("users");

        query.select("*").whereBetween("id", [1, 10]).orWhereNotBetween("id", [99, 100]);

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` between ? and ? or `id` not between ? and ?");
        assert.deepEqual(query["_bindings"], [1, 10, 99, 100]);
    });
});

