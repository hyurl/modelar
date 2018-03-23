"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const db_1 = require("./db");
exports.createUser = async () => {
    var user = new User_1.User;
    user.name = "luna";
    user.email = "luna@hyurl.com";
    user.password = "12345";
    await user.use(db_1.db).save();
};
//# sourceMappingURL=create-user.js.map