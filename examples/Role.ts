import { Model, field, primary, autoIncrement } from "modelar";
import { User } from "./User";

export class Role extends Model {
    table = "roles";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 32)
    name: string;

    get users() {
        return <User>this.belongsToVia(User, "userroles", "role_id", "user_id");
    }
}