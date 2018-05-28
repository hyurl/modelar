var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.union()", function () {
    describe("union(sql: string, all?: boolean)", function () {
        it("should generate SQL that unions two SQLs", function () {
            var query = new Query("users").select("*");
            query.union("select * from `articles`");
            assert.equal(query.getSelectSQL(), "select * from `users` union select * from `articles`");
        });

        it("should generate SQL that unions two SQLs with union all statement", function () {
            var query = new Query("users").select("*");
            query.union("select * from `articles`", true);
            assert.equal(query.getSelectSQL(), "select * from `users` union all select * from `articles`");
        });
    });

    describe("union(query: Query, all?: boolean)", function () {
        it("should generate SQL that unions two queries", function () {
            var query = new Query("users").select("*"),
                query2 = new Query("articles").select("*");
            query.union(query2);
            assert.equal(query.getSelectSQL(), "select * from `users` union select * from `articles`");
        });

        it("should generate SQL that unions two queries with union all statement", function () {
            var query = new Query("users").select("*"),
                query2 = new Query("articles").select("*").where("id", 1);
            query.union(query2, true);
            assert.equal(query.getSelectSQL(), "select * from `users` union all select * from `articles` where `id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });
    });
});