var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

describe("Query.prototype.update()", function () {
    it("should update data as expected", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);

        query.insert({
            name: "Ayon Lee",
            email: "i@hyurl.com",
            password: "123456"
        }).then(function () {
            return query2.where("id", query.insertId).update({
                name: "Ayonium",
                email: "ayon@hyurl.com"
            });
        }).then(function () {
            assert.equal(query2.sql, "update `users` set `name` = ?, `email` = ? where `id` = ?");
            assert.deepEqual(query2.bindings, ["Ayonium", "ayon@hyurl.com", query.insertId]);
            assert.equal(query2.affectedRows, 1);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Query.prototype.increase()", function () {
    describe("increase(field: string, step?: number)", function () {
        it("should increase the user age as expected", function (done) {
            var db = new DB(config),
                query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);

            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
            }).then(function () {
                return query2.where("id", query.insertId).increase("age");
            }).then(function () {
                assert.equal(query2.sql, "update `users` set `age` = `age` + ? where `id` = ?");
                assert.deepEqual(query2.bindings, [1, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(function () {
                return query3.where("id", query.insertId).increase("age", 5);
            }).then(function () {
                assert.equal(query3.sql, "update `users` set `age` = `age` + ? where `id` = ?");
                assert.deepEqual(query3.bindings, [5, query.insertId]);
                assert.equal(query3.affectedRows, 1);
            }).then(function () {
                db.close();
                done();
            }).catch(err => {
                db.close();
                done(err);
            });
        });
    });

    describe("increase(fields: { [field: string]: number })", function () {
        it("should increase the user age and score as expected", function (done) {
            var db = new DB(config),
                query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);

            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 60
            }).then(function () {
                return query2.where("id", query.insertId).increase({
                    age: 5,
                    score: 20
                });
            }).then(function () {
                assert.equal(query2.sql, "update `users` set `age` = `age` + ?, `score` = `score` + ? where `id` = ?");
                assert.deepEqual(query2.bindings, [5, 20, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(function () {
                db.close();
                done();
            }).catch(err => {
                db.close();
                done(err);
            });
        });
    });
});

describe("Query.prototype.decrease()", function () {
    describe("decrease(field: string, step?: number)", function () {
        it("should decrease the user age and score as expected", function (done) {
            var db = new DB(config),
                query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);

            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
            }).then(function () {
                return query2.where("id", query.insertId).decrease("age");
            }).then(function () {
                assert.equal(query2.sql, "update `users` set `age` = `age` - ? where `id` = ?");
                assert.deepEqual(query2.bindings, [1, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(function () {
                return query3.where("id", query.insertId).decrease("age", 5);
            }).then(function () {
                assert.equal(query3.sql, "update `users` set `age` = `age` - ? where `id` = ?");
                assert.deepEqual(query3.bindings, [5, query.insertId]);
                assert.equal(query3.affectedRows, 1);
            }).then(function () {
                db.close();
                done();
            }).catch(err => {
                db.close();
                done(err);
            });
        });
    });

    describe("decrease(fields: { [field: string]: number })", function () {
        it("should decrease the user age as expected", function (done) {
            var db = new DB(config),
                query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);

            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 60
            }).then(function () {
                return query2.where("id", query.insertId).decrease({
                    age: 5,
                    score: 20
                });
            }).then(function () {
                assert.equal(query2.sql, "update `users` set `age` = `age` - ?, `score` = `score` - ? where `id` = ?");
                assert.deepEqual(query2.bindings, [5, 20, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(function () {
                db.close();
                done();
            }).catch(function (err) {
                db.close();
                done(err);
            });
        });
    });
});