"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Country_1 = require("./Country");
const db_1 = require("./db");
exports.createCounties = async () => {
    await new Country_1.Country({
        name: "China"
    }).use(db_1.db).save();
    await new Country_1.Country({
        name: "Japan"
    }).use(db_1.db).save();
};
//# sourceMappingURL=create-countries.js.map