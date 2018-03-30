"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Article_1 = require("./Article");
const db = require("modelar/test/db");
exports.createArticles = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield new Article_1.Article({
        title: "A example article #1",
        content: "Test content."
    }).use(db).save();
    yield new Article_1.Article({
        title: "A example article #2",
        content: "Test content."
    }).use(db).save();
});
//# sourceMappingURL=create-articles.js.map