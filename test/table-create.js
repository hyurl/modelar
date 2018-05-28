var assert = require("assert");
var DB = require("../").DB;
var Table = require("../").Table;
var config = require("./config/db");

describe("Table.prototype.getDDL() and Table.prototype.drop()", function () {
    it("should create and new table and drop it as expected", function (done) {
        var db = new DB(config),
            table = new Table("articles").use(db);

        table.addColumn("id", "int").primary().autoIncrement().notNull();
        table.addColumn("title", "varchar", 255).unique().notNull().comment("The title of the current article.");
        table.addColumn("content", "text");

        table.create().then(function () {
            assert.equal(table.sql, [
                "create table `articles` (",
                "\t`id` int auto_increment not null,",
                "\t`title` varchar(255) unique not null comment 'The title of the current article.',",
                "\t`content` text,",
                "\tprimary key (`id`)",
                ") engine=InnoDB default charset=utf8 auto_increment=1"
            ].join("\n"));
        }).then(function () {
            return table.drop();
        }).then(function () {
            assert.equal(table.sql, "drop table `articles`");
            db.close();
            done();
        }).catch(function (err) {
            db.close();
            done(err);
        });
    });
});