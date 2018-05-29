var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");

describe("Model.prototype.insert()", function () {
    it("should insert a model to database as expected", function (done) {
        var db = new DB(config),
            fields = ["id", "name", "email", "password", "age", "score"],
            data = {
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 90
            },
            model = new Model(null, {
                table: "users",
                primary: "id",
                fields: fields,
                searchable: ["name", "email"]
            });

        model.use(db).insert(data).then(function () {
            assert.deepStrictEqual(model.data, Object.assign({ id: model.insertId }, data));
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});