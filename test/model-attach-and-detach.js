var assert = require("assert");
var DB = require("../").DB;
var config = require("./config/db");
var co = require("co");
var User = require("./classes/user-role").User;
var Role = require("./classes/user-role").Role;

describe("Model.prototype.attach() & Model.prototype.detach()", function () {
    it("should add, update and remove associations as expected", function (done) {
        var db = new DB(config);

        co(function* () {
            var user1 = new User({ name: "Ayon Lee", email: "i@hyurl.com" }),
                user2 = new User({ name: "Luna", email: "luna@hyurl.com" }),
                user3 = new User({ name: "April", email: "april@hyurl.com" }),
                role1 = new Role({ name: "admin" }),
                role2 = new Role({ name: "tester" });

            yield user1.use(db).save();
            yield user2.use(db).save();
            yield user3.use(db).save();
            yield role1.use(db).save();
            yield role2.use(db).save();

            // attach with IDs
            yield user1.roles.attach([role1.id, role2.id]);
            // attach with models
            yield role1.users.attach([user1, user2]);

            // attach with additional fields
            var data = {};
            data[role1.id] = { activated: 1 };
            data[role2.id] = { activated: 0 };
            yield user3.roles.attach(data);

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
            assert.strictEqual(users.length, 3);

            for (var i in roles) {
                assert.deepStrictEqual(roles[i].data, i == "0" ? role1.data : role2.data);
            }

            var _users = [user1, user2, user3];
            for (var i in users) {
                assert.deepStrictEqual(users[i].data, _users[i].data);
            }

            var _role2 = user3.roles;
            /** @type {Role[]} */
            var _roles = yield _role2.withPivot("activated").all();
            assert.equal(_role2.sql, "select `roles4`.*, `user_role`.`activated` from `roles4` inner join `user_role` on `user_role`.`role_id` = `roles4`.`id` where `id` in (select `role_id` from `user_role` where `user_id` = ?) and `user_role`.`user_id` = ?");
            assert.deepStrictEqual(_role2.bindings, [user3.id, user3.id]);
            assert.equal(_roles.length, 2);

            for (var i in _roles) {
                assert.deepStrictEqual(_roles[i].data, i == "0" ? role1.data : role2.data);
                assert.strictEqual(_roles[i].extra.activated, i == "0" ? 1 : 0);
            }

            // update with IDs
            yield user1.roles.attach([role1.id]);

            // attach with additional fields
            var data = {};
            data[role1.id] = { activated: 0 };
            data[role2.id] = { activated: 1 };
            yield user3.roles.attach(data);

            roles = yield user1.roles.all();
            _roles = yield user3.roles.withPivot("activated").all();

            assert.equal(roles.length, 1);
            assert.equal(_roles.length, 2);
            assert.deepStrictEqual(roles[0].data, role1.data);

            for (var i in _roles) {
                assert.deepStrictEqual(_roles[i].data, i == "0" ? role1.data : role2.data);
                assert.strictEqual(_roles[i].extra.activated, i == "0" ? 0 : 1);
            }

            // update with models
            yield user1.roles.attach([role2]);
            roles = yield user1.roles.all();
            assert.equal(roles.length, 1);
            assert.deepStrictEqual(roles[0].data, role2.data);

            // detach with IDs
            yield user1.roles.detach([role2.id]);
            var hasError1 = false;
            try {
                roles = yield user1.roles.all();
            } catch (err) {
                assert.equal(err.name, "NotFoundError");
                hasError1 = true;
            }
            assert(hasError1);

            // detach with models
            yield user1.roles.attach([role1, role2]);
            roles = yield user1.roles.all();
            assert.equal(roles.length, 2);
            yield user1.roles.detach([role1]);
            roles = yield user1.roles.all();
            assert.equal(roles.length, 1);
            assert.deepStrictEqual(roles[0].data, role2.data);

            // detach all
            yield user3.roles.detach();
            var hasError2 = false;
            try {
                _roles = yield user3.roles.all();
            } catch (err) {
                assert.equal(err.name, "NotFoundError");
                hasError2 = true;
            }
            assert(hasError2);
        }).then(function () {
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});