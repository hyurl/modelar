var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");
var co = require("co");

describe("Model.prototype.getMany()", function () {
    it("should get many models that suit the given condition from database", function (done) {
        var db = new DB(config),
            fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            modelConf = {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            },
            ids = [];

        co(function* () {
            for (var i = 0; i < 10; i++) {
                var model = new Model(data, modelConf).use(db);
                model = yield model.save();
                ids.push(model.id);
            }

            var _model = new Model(null, modelConf);

            return _model.use(db).whereIn("id", ids)
                .getMany().then(function (res) {
                    assert.equal(_model.sql, "select * from `users` where `id` in (" + Array(10).fill("?").join(", ") + ") order by `id` asc limit 10");

                    var info = Object.assign({}, res),
                        models = res.data;

                    delete info.data;
                    assert.deepStrictEqual(info, {
                        page: 1,
                        pages: 1,
                        limit: 10,
                        total: 10,
                        keywords: "",
                        orderBy: "id",
                        sequence: "asc"
                    });
                    for (var i in models) {
                        assert(models[i] instanceof Model);
                        assert.deepStrictEqual(models[i].data, Object.assign({
                            id: ids[i]
                        }, data));
                    }
                });
        }).then(function () {
            var _model = new Model(null, modelConf);

            return _model.use(db).whereIn("id", ids)
                .getMany({
                    page: 2,
                    limit: 5,
                    sequence: "desc",
                    keywords: "i@hyurl.com"
                }).then(function (res) {
                    assert.equal(_model.sql, "select * from `users` where `id` in (" + Array(10).fill("?").join(", ") + ") and ((`name` like ?) or (`email` like ?)) order by `id` desc limit 5,5");
                    assert.deepStrictEqual(_model.bindings, [].concat(ids, ["%i@hyurl.com%", "%i@hyurl.com%"]));

                    var info = Object.assign({}, res),
                        models = res.data;

                    delete info.data;
                    assert.deepStrictEqual(info, {
                        page: 2,
                        pages: 2,
                        limit: 5,
                        total: 10,
                        keywords: "i@hyurl.com",
                        orderBy: "id",
                        sequence: "desc"
                    });

                    var _ids = [].concat(ids).slice(0, 5);
                    _ids.reverse();
                    
                    for (var i in models) {
                        assert(models[i] instanceof Model);
                        assert.deepStrictEqual(models[i].data, Object.assign({
                            id: _ids[i]
                        }, data));
                    }
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