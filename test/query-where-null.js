const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.whereNull()", () => {
    it("should generate SQL with a where is null clause", () => {
        let query = new Query("users").select("*").whereNull("email");
        assert.equal(query.getSelectSQL(), "select * from `users` where `email` is null");
    });
});

describe("Query.prototype.whereNotNull()", () => {
    it("should generate SQL with a where is not null clause", () => {
        let query = new Query("users").select("*").whereNotNull("email");
        assert.equal(query.getSelectSQL(), "select * from `users` where `email` is not null");
    });
});

describe("Query.prototype.orWhereNull()", () => {
    it("should generate SQL with a or where is null clause", () => {
        let query = new Query("users").select("*").where("name", "Luna").orWhereNull("email");
        assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `email` is null");
        assert.deepEqual(query["_bindings"], ["Luna"]);
    });
});

describe("Query.prototype.orWhereNotNull()", () => {
    it("should generate SQL with a or where is not null clause", () => {
        let query = new Query("users").select("*").where("name", "Luna").orWhereNotNull("email");
        assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `email` is not null");
        assert.deepEqual(query["_bindings"], ["Luna"]);
    });
});