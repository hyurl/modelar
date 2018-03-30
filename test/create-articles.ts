import { DB } from "modelar";
import { Article } from "./Article";
const db: DB = require("modelar/test/db");

export var createArticles = async () => {
    await new Article({
        title: "A example article #1",
        content: "Test content."
    }).use(db).save();

    await new Article({
        title: "A example article #2",
        content: "Test content."
    }).use(db).save();
};