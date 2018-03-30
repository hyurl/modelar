"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const User_1 = require("./User");
const db = require("modelar/test/db");
exports.loginUser = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    return yield User_1.User.use(db).login({
        name: "luna",
        password: "12345"
    });
});
//# sourceMappingURL=login-user.js.map