import { Role } from "./Role";
import { db } from "./db";

export var createRoles = async () => {
    await new Role({
        name: "admin"
    }).use(db).save();

    await new Role({
        name: "editor"
    }).use(db).save();

    await new Role({
        name: "member"
    }).use(db).save();
}