var DB = require("../../").DB;
var Table = require("../../").Table;
var co = require("co");
var config = require("../config/db");

co(function* () {
    var db = new DB(config);

    try {
        var table1 = new Table("articles2").use(db),
            table2 = new Table("articles3").use(db),
            table3 = new Table("regions").use(db),
            table4 = new Table("roles4").use(db),
            table5 = new Table("tags2").use(db),
            table6 = new Table("user_role").use(db),
            table7 = new Table("users").use(db),
            table8 = new Table("users2").use(db),
            table9 = new Table("users3").use(db),
            table10 = new Table("users4").use(db);

        table1.addColumn("id").primary().autoIncrement();
        table1.addColumn("title", "varchar", 255).notNull();
        table1.addColumn("content", "varchar", 1024).default(null);
        table1.addColumn("user_id", "int").default(null);

        table2.addColumn("id").primary().autoIncrement();
        table2.addColumn("title", "varchar", 255).notNull();
        table2.addColumn("content", "varchar", 1024).default(null);
        table2.addColumn("user_id", "int").default(null);

        table3.addColumn("id").primary().autoIncrement();
        table3.addColumn("name", "varchar", 255).notNull();

        table4.addColumn("id").primary().autoIncrement();
        table4.addColumn("name", "varchar", 255).notNull();

        table5.addColumn("id").primary().autoIncrement();
        table5.addColumn("name", "varchar", 255).notNull();
        table5.addColumn("taggable_id", "int").default(null);
        table5.addColumn("type", "varchar", 255).default(null);

        table6.addColumn("user_id", "int").notNull();
        table6.addColumn("role_id", "int").notNull();
        table6.addColumn("activated", "int").default(null);

        table7.addColumn("id").primary().autoIncrement();
        table7.addColumn("name", "varchar", 32).notNull();
        table7.addColumn("email", "varchar", 255).notNull();
        table7.addColumn("password", "varchar", 64).notNull();
        table7.addColumn("age", "int").default(null);
        table7.addColumn("score", "int").default(null);

        table8.addColumn("id").primary().autoIncrement();
        table8.addColumn("name", "varchar", 32).notNull();
        table8.addColumn("email", "varchar", 255).notNull();

        table9.addColumn("id").primary().autoIncrement();
        table9.addColumn("name", "varchar", 32).notNull();
        table9.addColumn("email", "varchar", 255).notNull();
        table9.addColumn("region_id", "int").default(null);

        table10.addColumn("id").primary().autoIncrement();
        table10.addColumn("name", "varchar", 32).notNull();
        table10.addColumn("email", "varchar", 255).notNull();

        yield table1.save();
        yield table2.save();
        yield table3.save();
        yield table4.save();
        yield table5.save();
        yield table6.save();
        yield table7.save();
        yield table8.save();
        yield table9.save();
        yield table10.save();

        console.log("#### OK ####");
    } catch (err) {
        throw err;
    } finally {
        db.close();
    }
});