const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.groupBy()", () => {
    describe("groupBy(fields: string[])", () => {
        it("should generate SQL with a group by clause via an array argument of strings", () => {
            let query = new Query("users").select("*").groupBy(["name", "email"]);
            assert.equal(query.getSelectSQL(), "select * from `users` group by `name`, `email`");
        });
    });

    describe("groupBy(...fields: string[])", () => {
        it("should generate SQL with a group by clause via rest arguments of strings", () => {
            let query = new Query("users").select("*").groupBy("name", "email");
            assert.equal(query.getSelectSQL(), "select * from `users` group by `name`, `email`");
        });
    });
});

describe("Query.prototype.having()", () => {
    it("should generate SQL with a group by and a having clause", () => {
        let query = new Query("users").select("*").groupBy("name", "email").having("`id` > 1");
        assert.equal(query.getSelectSQL(), "select * from `users` group by `name`, `email` having `id` > 1");
    });
});