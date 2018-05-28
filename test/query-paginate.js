var assert = require("assert");
var DB = require("../").DB;
var Query = require("../").Query;
var config = require("./config/db");
var co = require("co");

describe("Query.prototype.paginate()", function () {
    it("should get paginated users that suit the given condition", function (done) {
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
            ids = [];

        co(function* () {
            for (var i = 0; i < 20; i++) {
                yield query.insert(data);
                ids.push(query.insertId);
            }

            var res = yield query.whereIn("id", ids).limit(10).paginate(1);
            assert.equal(query.sql, "select * from `users` where `id` in (" + Array(20).fill("?").join(", ") + ") limit 10");

            var _data = Array(10).fill({});
            for (var i in _data) {
                _data[i] = Object.assign({
                    id: res.data[0].id + parseInt(i)
                }, data);
            }
            assert.deepStrictEqual(res, {
                page: 1,
                pages: 2,
                limit: 10,
                total: 20,
                data: _data
            });

            var res2 = yield query2.whereIn("id", ids).paginate(3, 5);
            assert.equal(query2.sql, "select * from `users` where `id` in (" + Array(20).fill("?").join(", ") + ") limit 10,5");

            var _data = Array(5).fill({});
            for (var i in _data) {
                _data[i] = Object.assign({
                    id: res2.data[0].id + parseInt(i)
                }, data);
            }
            assert.deepStrictEqual(res2, {
                page: 3,
                pages: 4,
                limit: 5,
                total: 20,
                data: _data
            });
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});