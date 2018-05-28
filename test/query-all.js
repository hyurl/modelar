var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

describe("Query.prototype.all()", function () {
    it("should get all users that suit the given condition as expected", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db),
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            data2 = {
                name: "Luna",
                email: "luna@hyurl.com",
                password: "123456",
                age: 32,
                score: 80
            },
            ids = [];

        query.insert(data).then(function () {
            ids.push(query.insertId);
            return query.insert(data2);
        }).then(function () {
            ids.push(query.insertId);
            return query2.whereIn("id", ids).all();
        }).then(function (_data) {
            let __data = [
                Object.assign({id: ids[0]}, data),
                Object.assign({id: ids[1]}, data2)
            ];
            assert.deepStrictEqual(_data, __data);
            assert.equal(query2.sql, "select * from `users` where `id` in (?, ?)");
            assert.deepEqual(query2.bindings, ids);
            assert.deepStrictEqual(query2.data, __data);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});