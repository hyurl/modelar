var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");
var co = require("co");

describe("Model.prototype.paginate()", function () {
    it("should get paginated models that suit the given condition from database", function (done) {
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

            var offset = 0;

            return (new Model(null, modelConf)).use(db).whereIn("id", ids)
                .paginate(1, 5).then(function (models) {
                    assert.strictEqual(models.page, 1);
                    assert.strictEqual(models.pages, 2);
                    assert.strictEqual(models.limit, 5);
                    assert.strictEqual(models.total, 10);
                    assert.ok(models.data instanceof Array);
                    assert.strictEqual(models.data.length, models.length);

                    for (var i in models) {
                        assert(models[i] instanceof Model);
                        assert.deepStrictEqual(models[i].data, Object.assign({
                            id: ids[parseInt(i)]
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