var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.whereState()", function () {
    it("should update a model with certain state in database as expected", function (done) {
        var db = new DB(config),
            fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            _data = {
                name: "Luna",
                email: "luna@hyurl.com"
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
            return model.whereState("score", 90).update(_data);
        }).then(function () {
            assert.equal(model.sql, "update `users` set `name` = ?, `email` = ? where `id` = ? and `score` = ?");
            assert.deepStrictEqual(model.bindings, ["Luna", "luna@hyurl.com", id, 90]);
           
            return model.whereState("age", ">=", 20).update(_data);
        }).then(function () {
            assert.equal(model.sql, "update `users` set `name` = ?, `email` = ? where `id` = ? and `age` >= ?");
            assert.deepStrictEqual(model.bindings, ["Luna", "luna@hyurl.com", id, 20]);

            return model.whereState({
                age: 20,
                score: 90
            }).update(_data);
        }).then(function () {
            assert.equal(model.sql, "update `users` set `name` = ?, `email` = ? where `id` = ? and `age` = ? and `score` = ?");
            assert.deepStrictEqual(model.bindings, ["Luna", "luna@hyurl.com", id, 20, 90]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});