var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

describe("Query.prototype.insert()", function () {
    describe("insert(data: { [field: string]: any })", function () {
        it("should insert data with an object", function (done) {
            var db = new DB(config),
                query = new Query("users").use(db);

            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456"
            }).then(function () {
                assert.equal(query.sql, "insert into `users` (`name`, `email`, `password`) values (?, ?, ?)");
                assert.deepEqual(query.bindings, ["Ayon Lee", "i@hyurl.com", "123456"]);
            }).then(function () {
                db.close();
                done();
            }).catch(function (err) {
                db.close();
                done(err);
            });
        });
    });

    describe("insert(data: any[] })", function () {
        it("should insert data with an array", function (done) {
            var db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            var query = new Query("users").use(db);

            query.insert([
                1,
                "Ayon Lee",
                "i@hyurl.com",
                "123456"
            ]).then(function () {
                assert.equal(query.sql, "insert into `users` values (?, ?, ?, ?)");
                assert.deepEqual(query.bindings, [1, "Ayon Lee", "i@hyurl.com", "123456"]);
                db.close();
                done();
            }).catch(function (_err) {
                var err;

                if (_err.name == "AssertionError") {
                    err = _err;
                } else {
                    try {
                        assert.equal(query.sql, "insert into `users` values (?, ?, ?, ?)");
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