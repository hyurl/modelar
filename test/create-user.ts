import { DB } from "modelar";
import { User } from "./User";
const db: DB = require("modelar/test/db");

export var createUser = async () => {
    var user = new User;
    user.name = "luna";
    user.email = "luna@hyurl.com";
    user.password = "12345";

    await user.use(db).save();
};