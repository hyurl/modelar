var assert = require("assert");
var DB = require("../").DB;
var config = require("./config/db");
var co = require("co");
var User = require("./classes/user-role").User;
var Role = require("./classes/user-role").Role;
var Query = require("../").Query;

describe("Model.prototype.hasVia() & Model.prototype.belongsToVia()", function () {
    it("should create model associations as expected", function (done) {
        var db = new DB(config);

        co(function* () {
            var user1 = new User({ name: "Ayon Lee", email: "i@hyurl.com" }),
                user2 = new User({ name: "Luna", email: "luna@hyurl.com" }),
                role1 = new Role({ name: "admin" }),
                role2 = new Role({ name: "tester" });

            yield user1.use(db).save();
            yield user2.use(db).save();
            yield role1.use(db).save();
            yield role2.use(db).save();

            var query = new Query("user_role").use(db);
            var data = [{
                user_id: user1.id,
                role_id: role1.id
            }, {
                user_id: user1.id,
                role_id: role2.id
            }, {
                user_id: user2.id,
                role_id: role2.id
            }, {
                user_id: user2.id,
                role_id: role1.id
            }];

            for (var i in data) {
                yield query.insert(data[i]);
            }

            var _role = user1.roles;
            var _user = role1.users;
            /** @type {Role[]} */
            var roles = yield _role.all();
            /** @type {User[]} */
            var users = yield _user.all();

            assert.equal(_role.sql, "select * from `roles4` where `id` in (select `role_id` from `user_role` where `user_id` = ?)");
            assert.deepStrictEqual(_role.bindings, [user1.id]);
            assert.equal(_user.sql, "select * from `users4` where `id` in (select `user_id` from `user_role` where `role_id` = ?)");
            assert.deepStrictEqual(_user.bindings, [role1.id]);
            assert.strictEqual(roles.length, 2);
            assert.strictEqual(users.length, 2);

            for (var i in roles) {
                assert.deepStrictEqual(roles[i].data, i == "0" ? role1.data : role2.data);
            }

            for (var i in users) {
                assert.deepStrictEqual(users[i].data, i == "0" ? user1.data : user2.data);
            }
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});