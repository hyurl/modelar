module.exports = {
    connect(db) {
        return new Promise((resolve, reject) => {
            try {
                var driver = require("sqlite3"); //Import SQLite.
                db.__connection = new driver.Database(db.__config.database);
                resolve(db);
            } catch (err) {
                reject(err);
            }
        });
    },
    query(db, sql, bindings) {
        var i = db.sql.indexOf(" "),
            command = db.sql.substring(0, i).toLowerCase(),
            gets = ["select", "pragma"];
        return new Promise((resolve, reject) => {
            if (gets.includes(command)) {
                //Deal with select or pragma statements.
                db.__connection.all(sql, bindings, function(err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        db.__data = rows;
                        resolve(db);
                    }
                });
            } else {
                //Deal with other statements like insert/update/delete.
                db.__connection.run(sql, bindings, function(err) {
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
        db.__connection.close();
    },
    random(query) {
        query.__orderBy = "random()";
    },
};