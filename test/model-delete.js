var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.delete()", function () {
    it("should delete a model from database as expected", function (done) {
        var db = new DB(config),
            fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            model = new Model(data, {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            }),
            id = 0;

        model.use(db).save().then(function () {
            id = model.insertId;
            assert.deepStrictEqual(model.data, Object.assign({ id: id }, data));
            return model.delete();
        }).then(function () {
            assert.equal(model.sql, "delete from `users` where `id` = ?");
            assert.deepStrictEqual(model.bindings, [id]);
            return model.get();
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            try {
                assert.equal(err.name, "NotFoundError");
                assert.equal(err.message, "No Model was found by the given condition.");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});