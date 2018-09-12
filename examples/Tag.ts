import { Model, field, primary, autoIncrement } from "modelar";
import { User } from "./User";
import { Article } from "./Article";

export class Tag extends Model {
    table = "tags";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 32)
    name: string;

    get users() {
        return this.belongsToVia(User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
    
    get articles() {
        return this.belongsToVia(Article, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}