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

describe("Model.prototype.get()", function () {
    it("should get a model from database as expected", function (done) {
        co(function* () {
            var db = new DB(config),
                data = {
                    name: "Ayon Lee",
                    email: "i@hyurl.com",
                    password: "123456",
                    age: 20,
                    score: 90
                },
                model = new Model(data, modelConf),
                id = 0;

            try {
                yield model.use(db).save();

                id = model.insertId;
                yield model.get();

                assert.equal(model.sql, "select * from `users` where `id` = ? limit 1");
                assert.deepStrictEqual(model.bindings, [id]);
                assert.deepStrictEqual(model.data, Object.assign({ id: id }, data));
                done();
            } catch (err) {
                done(err);
            }

            db.close();
        });
    });

    it("should try to get a non-existent model and doesn't throw error", function (done) {
        co(function* () {
            var db = new DB(config);

            try {
                var model = new Model(null, modelConf);
                model.throwNotFoundError = false;

                var _model = yield model.use(db).where("id", null).get();

                assert.strictEqual(_model, null);
                assert.equal(model.sql, "select * from `users` where `id` = ? limit 1");
                assert.deepStrictEqual(model.bindings, [null]);
                done();
            } catch (err) {
                done(err);
            }

            db.close();
        });
    });
});