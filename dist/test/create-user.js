"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const User_1 = require("./User");
const db = require("modelar/test/db");
exports.createUser = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    var user = new User_1.User;
    user.name = "luna";
    user.email = "luna@hyurl.com";
    user.password = "12345";
    yield user.use(db).save();
});
//# sourceMappingURL=create-user.js.map