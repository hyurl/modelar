import { DB } from "modelar";
import { Comment } from "./Comment";
const db: DB = require("modelar/test/db");

export var createComments = async () => {
    await new Comment({
        content: "A test content for user #1.",
    }).use(db).save();

    await new Comment({
        content: "A test content for user #2.",
    }).use(db).save();

    await new Comment({
        content: "A test content for article #1.",
    }).use(db).save();

    await new Comment({
        content: "A test content for article #4.",
    }).use(db).save();
};