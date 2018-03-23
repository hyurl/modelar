"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Model_1 = require("./Model");
const decorators_1 = require("./decorators");
const bcrypt = require("bcrypt-nodejs");
const Errors_1 = require("./Errors");
class User extends Model_1.Model {
    constructor(data, config) {
        super(data, config);
        this.table = "users";
        this.on("save", () => {
            if (this.data.password === undefined)
                this.password = "";
        });
    }
    set password(v) {
        this.data.password = bcrypt.hashSync(v);
    }
    get password() {
        return undefined;
    }
    login(options) {
        let Class = this.constructor;
        if (options.password === undefined) {
            return Promise.reject(new TypeError(`The argument passed to ${Class.name}.login() `
                + `must contain a 'password' property.`));
        }
        let _options = {};
        if (options.user === undefined) {
            for (let k in options) {
                if (Class.loginable.includes(k)) {
                    _options[k] = options[k];
                }
            }
            if (Object.keys(_options).length === 0) {
                return Promise.reject(new TypeError(`The argument passed to ${Class.name}.login() `
                    + `must contain at least one login-able field.`));
            }
            this.where(_options);
        }
        else {
            for (let field of Class.loginable) {
                this.orWhere(field, options.user);
            }
        }
        return this.all().then(users => {
            let i = -1;
            return new Promise((resolve, reject) => {
                let loop = () => {
                    i += 1;
                    let password = users[i].data.password || "";
                    bcrypt.compare(options.password, password, (err, pass) => {
                        if (err)
                            reject(err instanceof Error ? err : new Error(err));
                        if (pass) {
                            this.data = users[i].data;
                            this.emit("login", this);
                            resolve(this);
                        }
                        else if (i < users.length - 1) {
                            loop();
                        }
                        else {
                            reject(new Errors_1.NotFoundError("The password you " +
                                `provided didn't match any ${Class.name}.`));
                        }
                    });
                };
                loop();
            });
        });
    }
    static login(options) {
        return (new this).login(options);
    }
}
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
exports.User = User;
//# sourceMappingURL=User.js.map