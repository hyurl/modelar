var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("model.extra", function () {
    it("should create a new model instance with extra data as expected", function () {
        var fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90,
                github: "github.com/hyurl"
            },
            _data = Object.assign({}, data),
            model = new Model(data, {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            });

        delete _data.github;
        assert.deepStrictEqual(model.data, _data);
        assert.deepStrictEqual(model.extra, { github: "github.com/hyurl" });
    });
});