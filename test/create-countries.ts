import { DB } from "modelar";
import { Country } from "./Country";
const db: DB = require("modelar/test/db");

export var createCounties = async () => {
    await new Country({
        name: "China"
    }).use(db).save();

    await new Country({
        name: "Japan"
    }).use(db).save();
};