var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

var data = {
    name: "Ayon Lee",
    email: "i@hyurl.com",
    password: "123456",
    age: 20,
    score: 90
};
var data2 = {
        name: "Luna",
        email: "luna@hyurl.com",
        password: "123456",
        age: 32,
        score: 80
    };

describe("Query.prototype.all()", function () {
    it("should get all users that suit the given condition as expected", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);
        ids = [];

        query.insert(data).then(function () {
            ids.push(query.insertId);
            return query.insert(data2);
        }).then(function () {
            ids.push(query.insertId);
            return query2.whereIn("id", ids).count();
        }).then(function (count) {
            assert.strictEqual(count, 2);
            assert.equal(query2.sql, "select count(*) as `num` from `users` where `id` in (?, ?)");
            assert.deepEqual(query2.bindings, ids);
            assert.deepStrictEqual(query2.data, [{ num: 2 }]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Query.prototype.max()", function () {
    it("should get the maximum score of users that suit the given condition", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);
        ids = [];

        query.insert(data).then(function () {
            ids.push(query.insertId);
            return query.insert(data2);
        }).then(function () {
            ids.push(query.insertId);
            return query2.whereIn("id", ids).max("score");
        }).then(function (count) {
            assert.strictEqual(count, 90);
            assert.equal(query2.sql, "select max(`score`) as `num` from `users` where `id` in (?, ?)");
            assert.deepEqual(query2.bindings, ids);
            assert.deepStrictEqual(query2.data, [{ num: 90 }]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Query.prototype.min()", function () {
    it("should get the minimum score of users that suit the given condition", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);
        ids = [];

        query.insert(data).then(function () {
            ids.push(query.insertId);
            return query.insert(data2);
        }).then(function () {
            ids.push(query.insertId);
            return query2.whereIn("id", ids).min("score");
        }).then(function (count) {
            assert.strictEqual(count, 80);
            assert.equal(query2.sql, "select min(`score`) as `num` from `users` where `id` in (?, ?)");
            assert.deepEqual(query2.bindings, ids);
            assert.deepStrictEqual(query2.data, [{ num: 80 }]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Query.prototype.avg()", function () {
    it("should get the average score of users that suit the given condition", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);
        ids = [];

        query.insert(data).then(function () {
            ids.push(query.insertId);
            return query.insert(data2);
        }).then(function () {
            ids.push(query.insertId);
            return query2.whereIn("id", ids).avg("score");
        }).then(function (count) {
            assert.strictEqual(count, 85);
            assert.equal(query2.sql, "select avg(`score`) as `num` from `users` where `id` in (?, ?)");
            assert.deepEqual(query2.bindings, ids);
            assert.deepStrictEqual(query2.data, [{ num: 85 }]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Query.prototype.sum()", function () {
    it("should get the summary score of users that suit the given condition", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);
        ids = [];

        query.insert(data).then(function () {
            ids.push(query.insertId);
            return query.insert(data2);
        }).then(function () {
            ids.push(query.insertId);
            return query2.whereIn("id", ids).sum("score");
        }).then(function (count) {
            assert.strictEqual(count, 170);
            assert.equal(query2.sql, "select sum(`score`) as `num` from `users` where `id` in (?, ?)");
            assert.deepEqual(query2.bindings, ids);
            assert.deepStrictEqual(query2.data, [{ num: 170 }]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});