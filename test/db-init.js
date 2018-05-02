const assert = require("assert");
const { DB } = require("../");

describe("DB.init()", () => {
    it("should initiate the DB class as expected", () => {
        let config = {
            type: "mysql",
            database: "modelar",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "161301"
        };

        DB.init(config);

        assert.deepEqual(DB.config, Object.assign({}, config, {
            charset: "utf8",
            connectionString: "",
            max: 50,
            protocol: "TCPIP",
            ssl: null,
            timeout: 5000
        }));
    });
});