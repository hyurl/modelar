var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.update()", function () {
    it("should update a model in database as expected", function (done) {
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
            return model.update(_data);
        }).then(function () {
            assert.equal(model.sql, "update `users` set `name` = ?, `email` = ? where `id` = ?");
            assert.deepStrictEqual(model.bindings, ["Luna", "luna@hyurl.com", id]);
            assert.deepStrictEqual(model.data, Object.assign({id: id}, data, _data));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Model.prototype.increase()", function () {
    it("should increase a model's score as expected", function (done) {
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
            return model.increase("score", 5);
        }).then(function () {
            assert.deepStrictEqual(model.data, Object.assign({id: id}, data, {
                score: 95
            }));
            return model.increase({
                age: 2,
                score: 3
            });
        }).then(function () {
            assert.deepStrictEqual(model.data, Object.assign({id: id}, data, {
                age: 22,
                score: 98
            }));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});

describe("Model.prototype.decrease()", function () {
    it("should decrease a model's score as expected", function (done) {
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
            return model.decrease("score", 5);
        }).then(function () {
            assert.deepStrictEqual(model.data, Object.assign({id: id}, data, {
                score: 85
            }));
            return model.decrease({
                age: 2,
                score: 3
            });
        }).then(function () {
            assert.deepStrictEqual(model.data, Object.assign({id: id}, data, {
                age: 18,
                score: 82
            }));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});