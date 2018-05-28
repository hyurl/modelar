"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Model_1 = require("./Model");
var decorators_1 = require("./decorators");
var bcrypt = require("bcrypt-nodejs");
var Errors_1 = require("./Errors");
var User = (function (_super) {
    tslib_1.__extends(User, _super);
    function User(data, config) {
        var _this = _super.call(this, data, config) || this;
        _this.table = "users";
        _this.on("save", function () {
            if (_this.data.password === undefined)
                _this.password = "";
        });
        return _this;
    }
    Object.defineProperty(User.prototype, "password", {
        get: function () {
            return undefined;
        },
        set: function (v) {
            this.data.password = bcrypt.hashSync(v);
        },
        enumerable: true,
        configurable: true
    });
    User.prototype.login = function (options) {
        var _this = this;
        var Class = this.constructor;
        if (options.password === undefined) {
            return Promise.reject(new TypeError("The argument passed to " + Class["name"] + ".login() "
                + "must contain a 'password' property."));
        }
        var _options = {};
        if (options.user === undefined) {
            for (var k in options) {
                if (Class.loginable.indexOf(k) >= 0) {
                    _options[k] = options[k];
                }
            }
            if (Object.keys(_options).length === 0) {
                return Promise.reject(new TypeError("The argument passed to " + Class["name"] + ".login() "
                    + "must contain at least one login-able field."));
            }
            this.where(_options);
        }
        else {
            for (var _i = 0, _a = Class.loginable; _i < _a.length; _i++) {
                var field_1 = _a[_i];
                this.orWhere(field_1, options.user);
            }
        }
        return this.all().then(function (users) {
            var i = -1;
            return new Promise(function (resolve, reject) {
                var loop = function () {
                    i += 1;
                    var password = users[i].data.password || "";
                    bcrypt.compare(options.password, password, function (err, pass) {
                        if (err)
                            reject(err instanceof Error ? err : new Error(err));
                        if (pass) {
                            _this.data = users[i].data;
                            _this.emit("login", _this);
                            resolve(_this);
                        }
                        else if (i < users.length - 1) {
                            loop();
                        }
                        else {
                            reject(new Errors_1.NotFoundError("The password you " +
                                ("provided didn't match any " + Class["name"] + ".")));
                        }
                    });
                };
                loop();
            });
        });
    };
    User.login = function (options) {
        return (new this).login(options);
    };
    User.loginable = ["name", "email"];
    tslib_1.__decorate([
        decorators_1.field,
        decorators_1.primary,
        decorators_1.autoIncrement
    ], User.prototype, "id", void 0);
    tslib_1.__decorate([
        decorators_1.field("varchar", 32),
        decorators_1.searchable
    ], User.prototype, "name", void 0);
    tslib_1.__decorate([
        decorators_1.field("varchar", 32),
        decorators_1.searchable
    ], User.prototype, "email", void 0);
    tslib_1.__decorate([
        decorators_1.field("varchar", 64)
    ], User.prototype, "password", null);
    return User;
}(Model_1.Model));
exports.User = User;
//# sourceMappingURL=User.js.map