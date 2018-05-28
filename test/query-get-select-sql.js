var assert = require("assert");
var Query = require("../").Query;

var query = new Query("users");

describe("Query.prototype.getSelectSQL()", function () {
    it("should generate a simple SQL", function () {
        query.select("*")

        assert.equal(query.getSelectSQL(), "select * from `users`");
    });

    it("should generate a simple SQL and select only 'name', `email`", function () {
        query.select("name", "email");

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users`");
    });

    it("should generate an SQL with where clause", function () {
        query.where("id", 1);

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ?");
        assert.deepEqual(query["_bindings"], [1]);
    });

    it("should generate an SQL with where clause and limit clause", function () {
        query.limit(10);

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? limit 10");
    });

    it("should generate an SQL with where clause, limit and offset clause", function () {
        query.limit(10, 6);

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? limit 6,10");
    });

    it("should generate an SQL with where clause, limit and offset clause, and order by clause", function () {
        query.orderBy("name");

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? order by `name` limit 6,10");
    });

    it("should generate an SQL with where clause, limit and offset clause, and order by asc clause", function () {
        query.orderBy("id", "asc");

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? order by `name`, `id` asc limit 6,10");
    });

    it("should generate an SQL with where clause, limit and offset clause, and order by rand() clause", function () {
        query.random();

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? order by rand() limit 6,10");
    });
});