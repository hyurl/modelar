const assert = require("assert");
const { DB, Query } = require("../");

describe("Query.prototype.insert()", () => {
    describe("insert(data: { [field: string]: any })", () => {
        it("should insert data with an object", (done) => {
            let db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            let query = new Query("users").use(db);

            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456"
            }).then(() => {
                assert.equal(query.sql, "insert into `users` (`name`, `email`, `password`) values (?, ?, ?)");
                assert.deepEqual(query.bindings, ["Ayon Lee", "i@hyurl.com", "123456"]);
            }).then(() => db.close()).then(done).catch((err) => {
                db.close();
                done(err);
            });
        });
    });

    describe("insert(data: any[] })", () => {
        it("should insert data with an array", (done) => {
            let db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            let query = new Query("users").use(db);

            query.insert([
                1,
                "Ayon Lee",
                "i@hyurl.com",
                "123456"
            ]).then(() => {
                assert.equal(query.sql, "insert into `users` values (?, ?, ?, ?)");
                assert.deepEqual(query.bindings, [1, "Ayon Lee", "i@hyurl.com", "123456"]);
            }).then(() => db.close()).then(done).catch((_err) => {
                let err;

                if (_err.name == "AssertionError") {
                    err = _err;
                } else {
                    try {
                        assert.equal(query.sql, "insert into `users` values (?, ?, ?, ?)");
                        assert.deepEqual(query.bindings, [1, "Ayon Lee", "i@hyurl.com", "123456"]);
                    } catch (_err) {
                        err = _err;
                    }
                }

                db.close();
                done(err);
            });
        });
    });
});