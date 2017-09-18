var getInsertId = (row, fields) => {
    for (let field of fields) {
        if (field.name.toLowerCase() == "id" || field.dataTypeID == 23)
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
                    driver = require("pg");
                db.__connection = new driver.Client({
                    host: config.host,
                    port: config.port,
                    user: config.user,
                    password: config.password,
                    database: config.database,
                    connect_timeout: config.timeout,
                    statement_timeout: config.timeout,
                    client_encoding: config.charset,
                });
                db.__connection.connect(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(db);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    },
    query(db, sql, bindings) {
        var i = sql.indexOf(" "),
            command = sql.substring(0, i).toLowerCase();
        //Return the record when inserting.
        if (command == "insert" && sql.search(/returning\s/) <= 0)
            sql += " returning *";
        //Replace ? to ${n} of the SQL.
        for (let i in bindings) {
            i++;
            sql = sql.replace("?", "$" + i);
        }
        // sql = sql.replace(/`/g, ""); //Drop back-quotes.
        return new Promise((resolve, reject) => {
            db.__connection.query(sql, bindings, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    db.affectedRows = res.rowCount || 0;
                    if (command == "insert") {
                        //Deal with insert statements.
                        db.insertId = getInsertId(res.rows[0], res.fields);
                    } else {
                        //Deal with other statements.
                        db.__data = res.rows.map(row => {
                            var data = {};
                            for (let key in row) {
                                data[key] = row[key];
                            }
                            return data;
                        });
                    }
                    resolve(db);
                }
            });
        });
    },
    close(db) {
        db.__connection.end();
    },
    random(query) {
        query.__orderBy = "random()";
    },
    limit(query, length, offset) {
        query.__limit = offset ? length + " offset " + offset : length;
    }
};