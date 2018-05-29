var assert = require("assert");
var DB = require("../").DB;
var Model = require("../").Model;
var config = require("./config/db");
var co = require("co");

describe("Model Inheritance", function () {
    it("should define a new class that extends Model as expected", function (done) {
        "use strict";

        class User extends Model {
            /**
             * 
             * @param {{[field: string]: any}} [data] 
             */
            constructor(data) {
                super(data, {
                    table: "users",
                    primary: "id",
                    fields: ["id", "name", "email", "password", "age", "score"],
                    searchable: ["name", "email"]
                });
            }

            /**
             * @param {string} v
             */
            set password(v) {
                this.data.password = v;
            }

            get password() {
                return undefined;
            }
        }

        var data = {
            name: "Ayon Lee",
            email: "i@hyurl.com",
            password: "123456",
            age: 20,
            score: 90
        };
        var db = new DB(config),
            user = new User(data).use(db),
            _data = Object.assign({}, data);

        delete _data.password;
        assert.deepStrictEqual(user.data, data);
        assert.deepStrictEqual(user.toString(), JSON.stringify(_data));
        
        co(function* () {
            yield user.save();
            assert.equal(user.sql, "insert into `users` (`name`, `email`, `password`, `age`, `score`) values (?, ?, ?, ?, ?)");
            assert.deepStrictEqual(user.bindings, values(data));
            assert.deepStrictEqual(user.data, Object.assign({id: user.insertId}, data));
            assert.deepStrictEqual(user.valueOf(), Object.assign({id: user.insertId}, _data));

            user.name = "Luna";
            user.email = "i@hyurl.com";
            user.age = 32;
            yield user.save();
            assert.equal(user.sql, "update `users` set `name` = ?, `email` = ?, `age` = ? where `id` = ?");
            assert.deepStrictEqual(user.bindings, ["Luna", "i@hyurl.com", 32, user.id]);
            assert.deepStrictEqual(user.data, {
                id: user.id,
                name: "Luna",
                email: "luna@hyurl.com",
                password: "123456",
                age: 32,
                score: 90
            });

            yield user.delete();
            assert.equal(user.sql, "delete from `users` where `id` = ?");
            assert.deepStrictEqual(user.bindings, [user.id]);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done();
        });
    });
});