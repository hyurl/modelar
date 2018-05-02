const assert = require("assert");
const { DB } = require("../");

describe("DB.prototype.use()", () => {
    it("should use an existing DB instance and its connections as expected", () => {
        let config = {
            type: "mysql",
            database: "modelar",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "161301"
        };

        let db = new DB(config);
        let db2 = new DB().use(db);

        assert.deepEqual(db2.config, Object.assign({}, config, {
            charset: "utf8",
            connectionString: "",
            max: 50,
            protocol: "TCPIP",
            ssl: null,
            timeout: 5000
        }));

        assert.equal(db2.dsn, "mysql://root:161301@localhost:3306/modelar");

        assert.equal(db2.adapter, db.adapter);
    });
});