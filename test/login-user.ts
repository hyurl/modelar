import { User } from "./User";
import { db } from "./db";

export var loginUser = async () => {
    return await (<User>User.use(db)).login({
        name: "luna",
        password: "12345"
    });
};