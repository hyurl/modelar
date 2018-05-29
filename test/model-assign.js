var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.assign()", function () {
    it("should assign data to a model as expected", function () {
        var fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            model = new Model(Object.assign({id: 1}, data), {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            });

        assert.deepStrictEqual(model.data, data);
        model.assign(Object.assign({id: 1}, data));
        assert.deepStrictEqual(model.data, Object.assign({id: 1}, data));
    });
});