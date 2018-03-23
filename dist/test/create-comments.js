"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Comment_1 = require("./Comment");
const db_1 = require("./db");
exports.createComments = async () => {
    await new Comment_1.Comment({
        content: "A test content for user #1.",
    }).use(db_1.db).save();
    await new Comment_1.Comment({
        content: "A test content for user #2.",
    }).use(db_1.db).save();
    await new Comment_1.Comment({
        content: "A test content for article #1.",
    }).use(db_1.db).save();
    await new Comment_1.Comment({
        content: "A test content for article #4.",
    }).use(db_1.db).save();
};
//# sourceMappingURL=create-comments.js.map