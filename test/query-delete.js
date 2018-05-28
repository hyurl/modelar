var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");

describe("Query.prototype.delete()", function () {
    it("should delete the user as expected", function (done) {
        var db = new DB(config),
            query = new Query("users").use(db),
            query2 = new Query("users").use(db);

        query.insert({
            name: "Ayon Lee",
            email: "i@hyurl.com",
            password: "123456"
        }).then(function () {
            return query2.where("id", query.insertId).delete();
        }).then(function () {
            assert.equal(query2.sql, "delete from `users` where `id` = ?");
            assert.deepEqual(query2.bindings, [query.insertId]);
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