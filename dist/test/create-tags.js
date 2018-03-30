"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Tag_1 = require("./Tag");
const db = require("modelar/test/db");
exports.createTags = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield new Tag_1.Tag({
        name: "best"
    }).use(db).save();
    yield new Tag_1.Tag({
        name: "good"
    }).use(db).save();
    yield new Tag_1.Tag({
        name: "bad"
    }).use(db).save();
    yield new Tag_1.Tag({
        name: "worst"
    }).use(db).save();
});
//# sourceMappingURL=create-tags.js.map