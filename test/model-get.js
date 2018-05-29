var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.get()", function () {
    it("should get a model from database as expected", function (done) {
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
            return model.get();
        }).then(function () {
            assert.equal(model.sql, "select * from `users` where `id` = ? limit 1");
            assert.deepStrictEqual(model.bindings, [id]);
            assert.deepStrictEqual(model.data, Object.assign({ id: id }, data));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});