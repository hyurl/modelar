"use strict";

var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

var fields = ["id", "name", "email", "password", "age", "score"],
    data = {
        name: "Ayon Lee",
        email: "i@hyurl.com",
        password: "123456",
        age: 20,
        score: 90
    };

describe("new Model()", function () {
    describe("new Model(data: object, config: ModelConfig)", function () {
        it("should create a new Model instance as expected", function () {
            var model = new Model(data, {
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

    describe("new Model(data: object)", function () {
        it("should create a new Model instance and assign configs to later", function () {
            var model = new Model(data);
            model.table = "users";
            model.primary = "id";
            model.fields = fields;
            model.searchable = ["name", "email"];

            assert.equal(model.table, "users");
            assert.equal(model.primary, "id");
            assert.deepStrictEqual(model.fields, fields);
            assert.deepStrictEqual(model.searchable, ["name", "email"]);
            assert.deepStrictEqual(model.schema, {});
            assert.deepStrictEqual(model.data, data);
        });
    })
});