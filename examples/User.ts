import { User as _User, field } from "modelar";
import { Article } from "./Article";
import { Comment } from "./Comment";
import { Country } from "./Country";
import { Role } from "./Role";
import { Tag } from "./Tag";

export class User extends _User {
    @field("int")
    country_id: number;

    get country() {
        return this.belongsTo(Country, "country_id");
    }

    get roles() {
        return this.hasVia(Role, "userroles", "role_id", "user_id").withPivot("activated");
    }

    get tags() {
        return this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
    }

    get articles() {
        return this.has(Article, "user_id");
    }

    get comments() {
        return this.has(Comment, "commentable_id", "commentable_type");
    }
}