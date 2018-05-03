const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.distinct()", () => {
    it("should generate SQL with a distinct statement", () => {
        let query = new Query()
            .distinct()
            .select("name")
            .from("users")
            .where("id", ">", 1);

        assert.equal(query.getSelectSQL(), "select distinct `name` from `users` where `id` > ?");
        assert.deepEqual(query["_bindings"], [1]);
    });
});