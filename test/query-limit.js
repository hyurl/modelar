const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.limit()", () => {
    describe("limit(length: number)", () => {
        it("should generate SQL with a limit clause", () => {
            let query = new Query().select("*").from("users").limit(10);
            assert.equal(query.getSelectSQL(), "select * from `users` limit 10");
        });
    });

    describe("limit(length: number, offset: number)", () => {
        it("should generate SQL with a limit clause along with an offset", () => {
            let query = new Query().select("*").from("users").limit(10, 31);
            assert.equal(query.getSelectSQL(), "select * from `users` limit 31,10");
        });
    });
})