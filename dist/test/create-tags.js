"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = require("./Tag");
const db_1 = require("./db");
exports.createTags = async () => {
    await new Tag_1.Tag({
        name: "best"
    }).use(db_1.db).save();
    await new Tag_1.Tag({
        name: "good"
    }).use(db_1.db).save();
    await new Tag_1.Tag({
        name: "bad"
    }).use(db_1.db).save();
    await new Tag_1.Tag({
        name: "worst"
    }).use(db_1.db).save();
};
//# sourceMappingURL=create-tags.js.map