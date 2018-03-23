import { Table } from "modelar";
import { Country } from "./Country";
import { User } from "./User";
import { Role } from "./Role";
import { Tag } from "./Tag";
import { Article } from "./Article";
import { Comment } from "./Comment";
import { db } from "./db";

console.log(db);

export var createTables = async () => {
    await Country.use(db).createTable();
    await User.use(db).createTable();
    await Role.use(db).createTable();
    await Tag.use(db).createTable();
    await Article.use(db).createTable();
    await Comment.use(db).createTable();

    var table: Table;

    table = new Table("userroles");
    table.addColumn("user_id", "int").notNull();
    table.addColumn("role_id", "int").notNull();
    table.addColumn("activated", "int").notNull().default(0);
    await table.use(db).save();

    table = new Table("taggables");
    table.addColumn("tag_id", "int").notNull();
    table.addColumn("taggable_id", "int").notNull();
    table.addColumn("taggable_type", "varchar", 255).default("");
    await table.use(db).save();
};