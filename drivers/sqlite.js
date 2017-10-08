module.exports = {
    connect(db) {
        return new Promise((resolve, reject) => {
            try {
                var driver = require("sqlite3"), // Import SQLite.
                    connection = new driver.Database(db.__config.database);
                // Make a reference to the connection.
                db.__connection.connection = connection;
                resolve(db);
            } catch (err) {
                reject(err);
            }
        });
    },
    query(db, sql, bindings) {
        return new Promise((resolve, reject) => {
            if (db.__connection.active === false) {
                throw new Error("Database connection is not available.");
            }
            var gets = ["select", "pragma"];
            if (gets.includes(db.__command)) {
                // Deal with select or pragma statements.
                db.__connection.connection.all(sql, bindings, function(err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        db.__data = rows;
                        resolve(db);
                    }
                });
            } else {
                // Deal with other statements like insert/update/delete.
                db.__connection.connection.run(sql, bindings, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        db.insertId = this.lastID;
                        db.affectedRows = this.changes;
                        resolve(db);
                    }
                });
            }
        });
    },
    close(db) {
        db.__connection.connection.close();
    },
    random(query) {
        query.__orderBy = "random()";
    },
};