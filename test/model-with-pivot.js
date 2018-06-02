var assert = require("assert");
var DB = require("../").DB;
var config = require("./config/db");
var co = require("co");
var User = require("./classes/user-role").User;
var Role = require("./classes/user-role").Role;

describe("Model.prototype.withPivot()", function () {
    it("should fetch data from the pivot table as expected", function (done) {
        var db = new DB(config);

        co(function * () {
            var user = new User({ name: "Ayon Lee", email: "i@hyurl.com" }),
                role1 = new Role({ name: "admin" }),
                role2 = new Role({ name: "tester" });

            yield user.use(db).save();
            yield role1.use(db).save();
            yield role2.use(db).save();

            var data = {};
            data[role1.id] = { activated: 1 };
            data[role2.id] = { activated: 1 };
            yield user.roles.attach(data);

            var _role = user.roles;
            /** @type {Role[]} */
            var roles = yield _role.withPivot("activated").all();
            assert.equal(_role.sql, "select `roles4`.*, `user_role`.`activated` from `roles4` inner join `user_role` on `user_role`.`role_id` = `roles4`.`id` where `id` in (select `role_id` from `user_role` where `user_id` = ?) and `user_role`.`user_id` = ?");
            assert.deepStrictEqual(_role.bindings, [user.id, user.id]);
            assert.strictEqual(roles.length, 2);
            assert.deepStrictEqual(roles[0].data, role1.data);
            assert.deepStrictEqual(roles[1].data, role2.data);
            assert.deepStrictEqual(roles[0].extra, { activated: 1 });
            assert.deepStrictEqual(roles[1].extra, { activated: 1 });
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});