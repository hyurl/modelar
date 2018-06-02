var assert = require("assert");
var modelar = require("../");
var config = require("./config/db");
var decorate = require("tslib").__decorate;

describe("Using @decorator", function () {
    it("should define a model class with decorators as expected", function () {
        "use strict";

        var fields = ["id", "name", "email", "password", "age", "score"];

        class User extends modelar.User {
            /**
             * 
             * @param {{[field: string]: any}} [data] 
             */
            constructor(data) {
                super(data, {
                    table: "users",
                    primary: "id",
                    fields: fields,
                    searchable: ["name", "email"]
                });
            }
        }

        decorate([modelar.field("int", 3),], User.prototype, "age", null);
        decorate([modelar.field("int", 3)], User.prototype, "score", null);

        /** @type {{[field: string]: modelar.FieldConfig}} */
        var schema = {
            id: {
                name: "id",
                type: "",
                length: 0,
                primary: true,
                autoIncrement: [1, 1],
                notNull: false,
                unique: false,
                unsigned: false,
                default: undefined,
                comment: "",
                foreignKey: null
            },
            name: {
                name: "name",
                type: "varchar",
                length: 32,
                primary: false,
                autoIncrement: false,
                notNull: false,
                unique: false,
                unsigned: false,
                default: undefined,
                comment: "",
                foreignKey: null
            },
            password: {
                name: "password",
                type: "varchar",
                length: 64,
                primary: false,
                autoIncrement: false,
                notNull: false,
                unique: false,
                unsigned: false,
                default: undefined,
                comment: "",
                foreignKey: null
            },
            email: {
                name: "email",
                type: "varchar",
                length: 32,
                primary: false,
                autoIncrement: false,
                notNull: false,
                unique: false,
                unsigned: false,
                default: undefined,
                comment: "",
                foreignKey: null
            },
            age: {
                name: "age",
                type: "int",
                length: 3,
                primary: false,
                autoIncrement: false,
                notNull: false,
                unique: false,
                unsigned: false,
                default: undefined,
                comment: "",
                foreignKey: null
            },
            score: {
                name: "score",
                type: "int",
                length: 3,
                primary: false,
                autoIncrement: false,
                notNull: false,
                unique: false,
                unsigned: false,
                default: undefined,
                comment: "",
                foreignKey: null
            }
        };
        var user = new User;
        var table = new modelar.Table(user);

        assert.equal(user.constructor.name, "User");
        assert.equal(user.table, "users");
        assert.equal(user.primary, "id");
        assert.deepStrictEqual(user.fields, fields);
        assert.deepStrictEqual(user.searchable, ["name", "email"]);
        assert.deepStrictEqual(user.schema, schema);
        assert.deepStrictEqual(table.schema, schema);
    });
});