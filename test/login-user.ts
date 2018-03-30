import { DB } from "modelar";
import { User } from "./User";
const db: DB = require("modelar/test/db");

export var loginUser = async () => {
    return await (<User>User.use(db)).login({
        name: "luna",
        password: "12345"
    });
};