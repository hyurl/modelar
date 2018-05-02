import { DB } from "modelar";
import { Tag } from "./Tag";
const db: DB = require("modelar/test/db");

export var createTags = async () => {
    await new Tag({
        name: "best"
    }).use(db).save();

    await new Tag({
        name: "good"
    }).use(db).save();

    await new Tag({
        name: "bad"
    }).use(db).save();

    await new Tag({
        name: "worst"
    }).use(db).save();
};