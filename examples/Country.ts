import { Model, field, primary, autoIncrement } from "modelar";
import { Article } from "./Article";
import { User } from "./User";

export class Country extends Model {
    table = "countries";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 32)
    name: string;

    get users() {
        return this.has(User, "country_id");
    }

    get articles() {
        return this.hasThrough(Article, User, "user_id", "country_id");
    }
}