import { Comment } from "./Comment";
import { db } from "./db";

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