var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

describe("Query.prototype.get()", function () {
    it("should get the user as expected", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db),
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            };

        query.insert(data).then(function () {
            return query2.where("id", query.insertId).get();
        }).then(function (_data) {
            var __data = Object.assign({ id:  query.insertId}, data);
            assert.deepStrictEqual(_data, __data);
            assert.equal(query2.sql, "select * from `users` where `id` = ? limit 1");
            assert.deepEqual(query2.bindings, [query.insertId]);
            assert.deepStrictEqual(query2.data, [__data]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});