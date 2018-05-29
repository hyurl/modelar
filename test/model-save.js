var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.save()", function () {
    it("should save a model to database as expected", function (done) {
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
            model.name = "Luna";
            model.email = "luna@hyurl.com";
            return model.save();
        }).then(function () {
            assert.deepStrictEqual(model.data, Object.assign({id: id}, data, {
                name: "Luna",
                email: "luna@hyurl.com"
            }));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});