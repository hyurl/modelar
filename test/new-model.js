var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("new Model()", function () {
    it("should create a new model instance as expected", function () {
        var fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            model = new Model(data, {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            });

        assert.equal(model.table, "users");
        assert.equal(model.primary, "id");
        assert.deepStrictEqual(model.fields, fields);
        assert.deepStrictEqual(model.searchable, ["name", "email"]);
        assert.deepStrictEqual(model.schema, {});
        assert.deepStrictEqual(model.data, data);
    });
});