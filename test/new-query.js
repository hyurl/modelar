var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

describe("new Query()", function () {
    it("should create a Query instance as expected", function () {
        var db = new DB(config);
        var query = new Query("users").use(db);

        assert.deepEqual(query.config, Object.assign({}, config, {
            charset: "utf8",
            connectionString: "",
            max: 50,
            protocol: "TCPIP",
            ssl: null,
            timeout: 5000
        }));

        assert.equal(query.dsn, "mysql://root@localhost:3306/modelar");
        assert.equal(query.sql, "");
        assert.deepEqual(query.bindings, []);
        assert.equal(query.insertId, 0);
        assert.equal(query.affectedRows, 0);
        assert.equal(query.command, "");
        assert.deepEqual(query.data, []);
        assert.equal(query.table, "users");
    });
});