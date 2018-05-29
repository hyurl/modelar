var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.toString() and JSON.stringify(model)", function () {
    it("should get string representation of a model as expected", function () {
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

        assert.equal(model.toString(), JSON.stringify(model));
        assert.equal(model.toString(true), JSON.stringify(model, null, "  "));
    });
});