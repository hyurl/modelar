var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.whereExists()", function () {
    it("should generate SQL with a where exists clause", function () {
        var query = new Query("users").select("*").whereExists(function (_query) {
            _query.select("*").from("users").where("name", "Ayon Lee");
        });

        assert.equal(query.getSelectSQL(), "select * from `users` where exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
    });
});

describe("Query.prototype.whereNotExists()", function () {
    it("should generate SQL with a where not exists clause", function () {
        var query = new Query("users").select("*").whereNotExists(function (_query) {
            _query.select("*").from("users").where("name", "Ayon Lee");
        });

        assert.equal(query.getSelectSQL(), "select * from `users` where not exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
    });
});

describe("Query.prototype.orWhereExists()", function () {
    it("should generate SQL with a or where exists clause", function () {
        var query = new Query("users").select("*").whereIn("id", [1, 10])
            .orWhereExists(function (_query) {
                _query.select("*").from("users").where("name", "Ayon Lee");
            });

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` in (?, ?) or exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], [1, 10, "Ayon Lee"]);
    });
});

describe("Query.prototype.orWhereNotExists()", function () {
    it("should generate SQL with a or where not exists clause", function () {
        var query = new Query("users").select("*").whereIn("id", [1, 10])
            .orWhereNotExists(function (_query) {
                _query.select("*").from("users").where("name", "Ayon Lee");
            });

        assert.equal(query.getSelectSQL(), "select * from `users` where `id` in (?, ?) or not exists (select * from `users` where `name` = ?)");
        assert.deepEqual(query["_bindings"], [1, 10, "Ayon Lee"]);
    });
});