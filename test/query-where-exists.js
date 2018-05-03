const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.whereExists()", () => {
    it("should generate SQL with a where exists clause", () => {
        let query = new Query("users").select("*").whereExists(_query => {
            _query.select("*").from("users").where("name", "Ayon Lee");
        });

        assert.equal(query.getSelectSQL(), "select * from `users` where exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
    });
});

describe("Query.prototype.whereNotExists()", () => {
    it("should generate SQL with a where not exists clause", () => {
        let query = new Query("users").select("*").whereNotExists(_query => {
            _query.select("*").from("users").where("name", "Ayon Lee");
        });

        assert.equal(query.getSelectSQL(), "select * from `users` where not exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
    });
});

describe("Query.prototype.orWhereExists()", () => {
    it("should generate SQL with a or where exists clause", () => {
        let query = new Query("users").select("*").whereIn("id", [1, 10])
            .orWhereExists(_query => {
                _query.select("*").from("users").where("name", "Ayon Lee");
            });

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` in (?, ?) or exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], [1, 10, "Ayon Lee"]);
    });
});

describe("Query.prototype.orWhereNotExists()", () => {
    it("should generate SQL with a or where not exists clause", () => {
        let query = new Query("users").select("*").whereIn("id", [1, 10])
            .orWhereNotExists(_query => {
                _query.select("*").from("users").where("name", "Ayon Lee");
            });

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` in (?, ?) or not exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], [1, 10, "Ayon Lee"]);
    });
});