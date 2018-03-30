"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Country_1 = require("./Country");
const db = require("modelar/test/db");
exports.createCounties = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    yield new Country_1.Country({
        name: "China"
    }).use(db).save();
    yield new Country_1.Country({
        name: "Japan"
    }).use(db).save();
});
//# sourceMappingURL=create-countries.js.map