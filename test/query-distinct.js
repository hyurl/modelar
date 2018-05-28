var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.distinct()", function () {
    it("should generate SQL with a distinct statement", function () {
        var query = new Query()
            .distinct()
            .select("name")
            .from("users")
            .where("id", ">", 1);

        assert.equal(query.getSelectSQL(), "select distinct `name` from `users` where `id` > ?");
        assert.deepEqual(query["_bindings"], [1]);
    });
});