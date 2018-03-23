import { Model, field, primary, searchable, autoIncrement, defaultValue } from "modelar";
import { User } from "./User";
import { Article } from "./Article";

export class Comment extends Model {
    table = "comments";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 1024)
    @defaultValue("")
    content: string;

    @field("int")
    commentable_id: number;

    @field("varchar", 32)
    commentable_type: string;

    get user() {
        return <User>this.belongsTo(User, "commentable_id", "commentable_type");
    }

    get article() {
        return <Article>this.belongsTo(Article, "commentable_id", "commentable_type");
    }
}