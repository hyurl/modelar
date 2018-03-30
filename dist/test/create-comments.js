"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Comment_1 = require("./Comment");
const db = require("modelar/test/db");
exports.createComments = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield new Comment_1.Comment({
        content: "A test content for user #1.",
    }).use(db).save();
    yield new Comment_1.Comment({
        content: "A test content for user #2.",
    }).use(db).save();
    yield new Comment_1.Comment({
        content: "A test content for article #1.",
    }).use(db).save();
    yield new Comment_1.Comment({
        content: "A test content for article #4.",
    }).use(db).save();
});
//# sourceMappingURL=create-comments.js.map