const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.where()", () => {
    describe("where(field: string, value: string | number | boolean | Date)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with one where clause", () => {

            query.where("id", 1);

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ?");
            assert.deepEqual(query["_bindings"], [1]);
        });

        it("should generate SQL with two where clauses", () => {
            query.where("name", "Ayon Lee");

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? and `name` = ?");
            assert.deepEqual(query["_bindings"], [1, "Ayon Lee"]);
        });
    });

    describe("where(field: string, operator: string, value: string | number | boolean | Date)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with where >", () => {
            query.where("id", ">", 1);

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` > ?");
            assert.deepEqual(query["_bindings"], [1]);
        });

        it("should generate SQL with where <>", () => {
            query.where("name", "<>", "Luna");

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` > ? and `name` <> ?");
            assert.deepEqual(query["_bindings"], [1, "Luna"]);
        });
    });

    describe("where(fields: { [field: string]: string | number | boolean | Date })", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with where clause that contains multiple equal conditions", () => {
            query.where({
                id: 1,
                name: "Ayon Lee",
                email: "i@hyurl.com"
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? and `name` = ? and `email` = ?");
            assert.deepEqual(query["_bindings"], [1, "Ayon Lee", "i@hyurl.com"]);
        });
    });

    describe("where(nested: (query: Query) => void)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where clause", () => {
            query.where("id", 1).where((query) => {
                query.where("name", "<>", "Luna").where("email", "i@hyurl.com");
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = ? and (`name` <> ? and `email` = ?)");
            assert.deepEqual(query["_bindings"], [1, "Luna", "i@hyurl.com"]);
        });
    });

    describe("where(field: string, nested: (query: Query) => void)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where clause compare to a specific field", () => {
            query.where("id", (query) => {
                query.select("id").from("users").where("name", "Ayon Lee").limit(1);
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` = (select `id` from `users` where `name` = ? limit 1)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
        });
    });

    describe("where(field: string, operator: string, nested: (query: Query) => void)", () => {
        let query = new Query("users");

        query.select("*");

        it("should generate SQL with a nested where clause compare to a specific field", () => {
            query.where("id", "<>", (query) => {
                query.select("id").from("users").where("name", "Ayon Lee").limit(1);
            });

            assert.equal(query.getSelectSQL(), "select * from `users` where `id` <> (select `id` from `users` where `name` = ? limit 1)");
            assert.deepEqual(query["_bindings"], ["Ayon Lee"]);
        });
    });
});