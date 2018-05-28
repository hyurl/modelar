var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.orderBy()", function () {
    describe("orderBy(field: string)", function () {
        it("should generate SQL with an order by clause", function () {
            var query = new Query("users").select("*").orderBy("id");
            assert.equal(query.getSelectSQL(), "select * from `users` order by `id`");
        });
    });

    describe("orderBy(field: string, sequence: 'asc' | 'desc')", function () {
        it("should generate SQL with an order by clause with desc", function () {
            var query = new Query("users").select("*").orderBy("id", "desc");
            assert.equal(query.getSelectSQL(), "select * from `users` order by `id` desc");
        });

        it("should generate SQL with an order by clause with two fields", function () {
            var query = new Query("users").select("*").orderBy("name").orderBy("id", "desc");
            assert.equal(query.getSelectSQL(), "select * from `users` order by `name`, `id` desc");
        });
    });
});

describe("Query.prototype.random()", function () {
    it("should generate SQL with an order by rand() clause", function () {
        var query = new Query("users").select("*").random();
        assert.equal(query.getSelectSQL(), "select * from `users` order by rand()");
    });
});