const assert = require("assert");
const { Query } = require("../");

var query = new Query("users");

describe("Query.prototype.getSelectSQL()", () => {
    it("should generate a simple SQL", () => {
        query.select("*")

        assert.equal(query.getSelectSQL(), "select * from `users`");
    });

    it("should generate a simple SQL and select only 'name', `email`", () => {
        query.select("name", "email");

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users`");
    });

    it("should generate an SQL with where clause", () => {
        query.where("id", 1);

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ?");
        assert.deepEqual(query["_bindings"], [1]);
    });

    it("should generate an SQL with where clause and limit clause", () => {
        query.limit(10);

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? limit 10");
    });

    it("should generate an SQL with where clause, limit and offset clause", () => {
        query.limit(10, 5);

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? limit 5,10");
    });

    it("should generate an SQL with where clause, limit and offset clause, and order by clause", () => {
        query.orderBy("name");

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? order by `name` limit 5,10");
    });

    it("should generate an SQL with where clause, limit and offset clause, and order by asc clause", () => {
        query.orderBy("id", "asc");

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? order by `name`, `id` asc limit 5,10");
    });

    it("should generate an SQL with where clause, limit and offset clause, and order by rand() clause", () => {
        query.random();

        assert.equal(query.getSelectSQL(), "select `name`, `email` from `users` where `id` = ? order by rand() limit 5,10");
    });
});