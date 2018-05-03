const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.orderBy()", () => {
    describe("orderBy(field: string)", () => {
        it("should generate SQL with an order by clause", () => {
            let query = new Query("users").select("*").orderBy("id");
            assert.equal(query.getSelectSQL(), "select * from `users` order by `id`");
        });
    });

    describe("orderBy(field: string, sequence: 'asc' | 'desc')", () => {
        it("should generate SQL with an order by clause with desc", () => {
            let query = new Query("users").select("*").orderBy("id", "desc");
            assert.equal(query.getSelectSQL(), "select * from `users` order by `id` desc");
        });

        it("should generate SQL with an order by clause with two fields", () => {
            let query = new Query("users").select("*").orderBy("name").orderBy("id", "desc");
            assert.equal(query.getSelectSQL(), "select * from `users` order by `name`, `id` desc");
        });
    });
});

describe("Query.prototype.random()", () => {
    it("should generate SQL with an order by rand() clause", () => {
        let query = new Query("users").select("*").random();
        assert.equal(query.getSelectSQL(), "select * from `users` order by rand()");
    });
});