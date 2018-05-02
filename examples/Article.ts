import { Model, field, primary, searchable, autoIncrement, defaultValue } from "modelar";
import { User } from "./User";
import { Comment } from "./Comment";
import { Country } from "./Country";
import { Tag } from "./Tag";

export class Article extends Model {
    table = "articles";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 255)
    @searchable
    title: string;

    @field("varchar", 1024)
    @defaultValue("")
    content: string;

    @field("int")
    @defaultValue(0)
    user_id: number;

    get user() {
        return <User>this.belongsTo(User, "user_id");
    }

    get country() {
        return <Country>this.belongsToThrough(Country, User, "user_id", "country_id");
    }

    get tags() {
        return <Tag>this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
    }

    get comments() {
        // Pass the argument `type` to define a polymorphic association.
        return <Comment>this.has(Comment, "commentable_id", "commentable_type");
    }
}