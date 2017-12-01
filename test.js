const { DB, Table, User } = require("./");

// Modify configurations here for connecting to an existing database,
// then run the command `npm test` to test the code.
DB.init({
    type: "mysql", // Could be 'mysql', 'maria' or 'postgres'.
    database: "modelar",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "161301"
});

DB.on("query", (db) => {
    console.log(db.sql, db.bindings, "\n");
});

(async () => {
    var db = null;
    try {
        db = new DB();

        console.log("Create a new table `users`:\n");
        var table = new Table("users");
        table.addColumn("id").primary().autoIncrement(10001);
        table.addColumn("name", "varchar", 32).notNull();
        table.addColumn("email", "varchar", 32).notNull();
        table.addColumn("password", "varchar", 64).notNull();
        table = await table.use(db).save();
        console.log(table);
        console.log("");

        // Model
        console.log("Insert a user into the database with 'User' model:\n");
        var user = new User;
        user.name = "luna";
        user.email = "luna@hyurl.com";
        user.password = "12345";
        user = await user.use(db).save();
        console.log(user);
    } catch (e) {
        console.log(e);
    }
    if (db)
        db.close();
})();