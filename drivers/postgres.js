var getInsertId = (db, row, fields) => {
    var primary = db.__primary || "id";
    for (let field of fields) {
        if (field.name.toLowerCase() == primary)
            return row[field.name];
    }
    return 0;
};

module.exports = {
    backquote: "\"",
    connect(db) {
        return new Promise((resolve, reject) => {
            try {
                var config = db.__config,
                    driver = require("pg"),
                    connection = new driver.Client({
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        database: config.database,
                        connect_timeout: config.timeout,
                        statement_timeout: config.timeout,
                        client_encoding: config.charset,
                    });
                connection.connect(err => {
                    if (err) {
                        reject(err);
                    } else {
                        db.__connection.connection = connection;
                        resolve(db);
                    }
                });
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
            // Return the record when inserting.
            if (db.__command == "insert" && sql.search(/returning\s/) <= 0)
                sql += " returning *";
            // Replace ? to ${n} of the SQL.
            for (let i in bindings) {
                i++;
                sql = sql.replace("?", "$" + i);
            }
            db.__connection.connection.query(sql, bindings, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    db.affectedRows = res.rowCount || 0;
                    if (db.__command == "insert") {
                        // Deal with insert statements.
                        db.insertId = getInsertId(db, res.rows[0], res.fields);
                    } else if (res.rows.length) {
                        // Deal with other statements.
                        db.__data = res.rows.map(row => {
                            return Object.assign({}, row);
                        });
                    }
                    resolve(db);
                }
            });
        });
    },
    close(db) {
        db.__connection.connection.end();
    },
    random(query) {
        query.__orderBy = "random()";
    },
    limit(query, length, offset) {
        query.__limit = offset ? length + " offset " + offset : length;
    }
};