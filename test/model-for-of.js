var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("for (var item of model)", function () {
    it("should iterate a model as expected", function () {
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

        var i = 0,
            keys = Object.keys(data);
        for (var item of model) {
            assert.equal(item.key, keys[i]);
            assert.equal(item.value, data[keys[i]]);
            i++;
        }
    });
});