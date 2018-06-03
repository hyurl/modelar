var assert = require("assert");
var Table = require("../").Table;

describe("Table.prototype.getDDL()", function () {
    it("should generate DDL as expected", function () {
        var table = new Table("articles");

        table.addColumn("id").primary().autoIncrement().notNull();
        table.addColumn("title", "varchar", 255).unique().notNull().comment("The title of the current article.");
        table.addColumn("content", "text");
        table.addColumn("user_id", "int", 10).default(null).unsigned().foreignKey("users", "id");

        assert.equal(table.getDDL(), [
            "create table `articles` (",
            "\t`id` int(10) auto_increment not null,",
            "\t`title` varchar(255) unique not null comment 'The title of the current article.',",
            "\t`content` text,",
            "\t`user_id` int(10) unsigned default null,",
            "\tprimary key (`id`),",
            "\tconstraint `user_id` foreign key (`user_id`) references `users` (`id`) on delete set null on update no action",
            ") engine=InnoDB default charset=utf8 auto_increment=1"
        ].join("\n"));
    });
});