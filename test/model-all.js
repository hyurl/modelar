var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");
var co = require("co");
var fields = ["id", "name", "email", "password", "age", "score"];
var modelConf = {
    table: "users",
    primary: "id",
    fields: fields,
    searchable: ["name", "email"]
};

describe("Model.prototype.all()", function () {
    it("should get all models that suit the given condition from database", function (done) {
        var db = new DB(config),
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            ids = [];

        co(function* () {
            for (var i = 0; i < 10; i++) {
                var model = new Model(data, modelConf).use(db);
                model = yield model.save();
                ids.push(model.id);
            }

            var _model = new Model(null, modelConf);
            /** @type {Model[]} */
            var models = yield _model.use(db)
                .whereIn("id", ids)
                .all();

            assert.equal(_model.sql, "select * from `users` where `id` in (" + Array(10).fill("?").join(", ") + ")");
            assert.deepStrictEqual(_model.bindings, ids);

            for (var i in models) {
                assert(models[i] instanceof Model);
                assert.deepStrictEqual(models[i].data, Object.assign({
                    id: ids[i]
                }, data));
            }
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });

    it("should try to get a non-existent models and doesn't throw error", function (done) {
        co(function* () {
            var db = new DB(config);

            try {
                var model = new Model(null, modelConf);
                model.throwNotFoundError = false;

                var _model = yield model.use(db).where("id", "<", 1).all();

                assert.deepStrictEqual(_model, []);
                done();
            } catch (err) {
                done(err);
            }

            db.close();
        });
    });
});