const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.orWhere()", () => {
    describe("orWhere(field: string, value: string | number | boolean | Date)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with where or clauses", () => {
            query.where("id", 1).orWhere("name", "Ayon Lee");

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? or `name` = ?");
            assert.deepEqual(query["_bindings"], [1, "Ayon Lee"]);
        });
    });

    describe("orWhere(field: string, operator: string, value: string | number | boolean | Date)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with where id > 1 or name <> 'Luna'", () => {
            query.orWhere("id", ">", 1).orWhere("name", "<>", "Luna");

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` > ? or `name` <> ?");
            assert.deepEqual(query["_bindings"], [1, "Luna"]);
        });
    });

    describe("orWhere(fields: { [field: string]: string | number | boolean | Date })", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with where or clause that contains multiple equal conditions", () => {
            query.orWhere({
                id: 1,
                name: "Ayon Lee",
                email: "i@hyurl.com"
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? or `name` = ? or `email` = ?");
            assert.deepEqual(query["_bindings"], [1, "Ayon Lee", "i@hyurl.com"]);
        });
    });

    describe("orWhere(nested: (query: Query) => void)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where or clause", () => {
            query.where("id", 1).orWhere((query) => {
                query.where("name", "<>", "Luna").where("email", "i@hyurl.com");
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? or (`name` <> ? and `email` = ?)");
            assert.deepEqual(query["_bindings"], [1, "Luna", "i@hyurl.com"]);
        });
    });

    describe("orWhere(field: string, nested: (query: Query) => void)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where or clause compare to a specific field", () => {
            query.where("name", "Ayon Lee").orWhere("id", (query) => {
                query.select("id").from("users").where("email", "i@hyurl.com").limit(1);
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `id` = (select `id` from `users` where `email` = ? limit 1)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee", "i@hyurl.com"]);
        });
    });

    describe("orWhere(field: string, operator: string, nested: (query: Query) => void)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where or clause compare to a specific field", () => {
            query.where("name", "Ayon Lee").orWhere("id", "<>", (query) => {
                query.select("id").from("users").where("email", "i@hyurl.com").limit(1);
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `name` = ? or `id` <> (select `id` from `users` where `email` = ? limit 1)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee", "i@hyurl.com"]);
        });
    });
});