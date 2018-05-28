var assert = require("assert");
var DB = require("../").DB;
var Table = require("../").Table;
var config = require("./config/db");

describe("new Table()", function () {
    describe("new Table(name: string)", function () {
        it("should create a Table instance as expected", function () {
            var db = new DB(config);
            var table = new Table("users").use(db);

            assert.deepEqual(table.config, Object.assign({}, config, {
                charset: "utf8",
                connectionString: "",
                max: 50,
                protocol: "TCPIP",
                ssl: null,
                timeout: 5000
            }));

            assert.equal(table.dsn, "mysql://root@localhost:3306/modelar");
            assert.equal(table.sql, "");
            assert.deepEqual(table.bindings, []);
            assert.equal(table.insertId, 0);
            assert.equal(table.affectedRows, 0);
            assert.equal(table.command, "");
            assert.deepEqual(table.data, []);
            assert.equal(table.name, "users");
            assert.deepStrictEqual(table.schema, {});
        });
    });

    describe("new Table(name: string, schema: { [field: string]: FieldConfig })", function () {
        var schema = {
            id: {
                name: "id",
                type: "int",
                length: 10,
                primary: true,
                autoIncrement: true,
                notNull: true,
            },
            name: {
                name: "name",
                type: "varchar",
                length: 32,
                default: null
            },
            email: {
                name: "email",
                type: "varchar",
                length: 32,
                default: null
            },
            password: {
                name: "password",
                type: "varchar",
                length: 64,
                default: null
            },
            age: {
                type: "int",
                length: 10,
                unsigned: true,
                default: null
            },
            score: {
                type: "int",
                length: 10,
                default: null
            }
        };
        var table = new Table("users", schema);

        for (var field in schema) {
            if (schema[field].name === undefined) {
                schema[field].name = field;
            }
        }

        assert.deepStrictEqual(table.schema, schema);
    });
});