"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const db_1 = require("./db");
exports.loginUser = async () => {
    return await User_1.User.use(db_1.db).login({
        name: "luna",
        password: "12345"
    });
};
//# sourceMappingURL=login-user.js.map