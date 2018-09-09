var assert = require("assert");
var modelar = require("..");
var config = require("./config/db");
var DB = modelar.DB;
var Query = modelar.Query;
var s = modelar.s;
var i = modelar.i;

describe("DB.Statement and DB.Identifier", function () {
    it("should produce a DB.Statement instance via tag `s`", function () {
        var statement = s`select * from users where id = ${1}`,
            db = new DB(config),
            res = db.processStatement(statement);

        assert.ok(statement instanceof DB.Statement);
        assert.equal(res.sql, "select * from users where id = ?");
        assert.deepStrictEqual(res.bindings, [1]);
    });

    it("should produce a DB.Identifier instance via tag `i`", function () {
        var id1 = i`users`,
            id2 = i`id`;

        assert.ok(id1 instanceof DB.Identifier);
        assert.equal(id1.name, "users");
        assert.equal(id2.name, "id");
    });

    it("should combine DB.Statement and DB.Identifier instance", function () {
        var statement = s`select * from ${i`users`} where ${i`id`} = ${1} and ${i`title`} = ${"Hello, World!"}`,
            db = new DB(config),
            res = db.processStatement(statement);

        assert.ok(statement instanceof DB.Statement);
        assert.equal(res.sql, "select * from `users` where `id` = ? and `title` = ?");
        assert.deepStrictEqual(res.bindings, [1, "Hello, World!"]);
    });

    it("should execute a query via DB.Statement and nested DB.Identifier with tags `s` and `i`", function (done) {
        var db = new DB(config);
        db.query(s`select * from ${i`users`} where ${i`name`} = ${'Ayon Lee'} limit 1`).then(db => {
            assert.equal(db.sql, "select * from `users` where `name` = ? limit 1");
            assert.deepStrictEqual(db.bindings, ["Ayon Lee"]);
            assert.deepStrictEqual(db.data, [{
                id: 2,
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "12345",
                age: null,
                score: null
            }]);
            db.close();
            done(null);
        }).catch((err) => {
            db.close();
            done(err);
        });
    });
});

describe("Query.where(clause: DB.Statement)", function () {
    var query = new Query("users");

    query.select("*");

    it("should generate SQL with one where clause", function () {

        query.where(s`id = ${1}`);

        assert.equal(query.getSelectSQL(), "select * from `users` where id = ?");
        assert.deepEqual(query["_bindings"], [1]);
    });

    it("should generate SQL with two where clauses via nested tagged template", function () {

        query.where(s`${i`name`} = ${"hyurl"}`);

        assert.equal(query.getSelectSQL(), "select * from `users` where id = ? and `name` = ?");
        assert.deepEqual(query["_bindings"], [1, "hyurl"]);
    });
});

describe("Query.where(field: string, value: DB.Identifier)", function () {
    it("should generate SQL with a where clause equals a DB.Identifier", function () {
        var query = new Query("users").select("*").where("users.name", i`users.nickname`);

        assert.equal(query.getSelectSQL(), "select * from `users` where `users`.`name` = `users`.`nickname`");
        assert.deepEqual(query["_bindings"], []);
    });
});