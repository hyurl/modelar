import { User } from "./User";
import { db } from "./db";

export var createUser = async () => {
    var user = new User;
    user.name = "luna";
    user.email = "luna@hyurl.com";
    user.password = "12345";

    await user.use(db).save();
};