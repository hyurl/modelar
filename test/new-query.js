const assert = require("assert");
const { DB, Query } = require("../");

describe("new Query()", () => {
    it("should create a Query instance as expected", () => {
        let config = {
            type: "mysql",
            database: "modelar",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "161301"
        };

        let db = new DB(config);
        let query = new Query("users").use(db);

        assert.deepEqual(query.config, Object.assign({}, config, {
            charset: "utf8",
            connectionString: "",
            max: 50,
            protocol: "TCPIP",
            ssl: null,
            timeout: 5000
        }));

        assert.equal(query.dsn, "mysql://root:161301@localhost:3306/modelar");
        assert.equal(query.sql, "");
        assert.deepEqual(query.bindings, []);
        assert.equal(query.insertId, 0);
        assert.equal(query.affectedRows, 0);
        assert.equal(query.command, "");
        assert.deepEqual(query.data, []);
        assert.equal(query.table, "users");
    });
});