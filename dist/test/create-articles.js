"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Article_1 = require("./Article");
const db_1 = require("./db");
exports.createArticles = async () => {
    await new Article_1.Article({
        title: "A example article #1",
        content: "Test content."
    }).use(db_1.db).save();
    await new Article_1.Article({
        title: "A example article #2",
        content: "Test content."
    }).use(db_1.db).save();
};
//# sourceMappingURL=create-articles.js.map