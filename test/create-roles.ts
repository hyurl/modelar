import { DB } from "modelar";
import { Role } from "./Role";
const db: DB = require("modelar/test/db");

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