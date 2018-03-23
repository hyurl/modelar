import { Country } from "./Country";
import { db } from "./db";

export var createCounties = async () => {
    await new Country({
        name: "China"
    }).use(db).save();

    await new Country({
        name: "Japan"
    }).use(db).save();
};