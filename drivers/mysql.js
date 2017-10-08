module.exports = {
    connect(db) {
        return new Promise((resolve, reject) => {
            try {
                var config = db.__config,
                    driver = require("mysql"),
                    connection = driver.createConnection({
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        database: config.database,
                        charset: config.charset,
                        connectTimeout: config.timeout,
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
            db.__connection.connection.query({
                sql: sql,
                values: bindings,
                timeout: db.__config.timeout,
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    if (res instanceof Array) {
                        // Deal with select or pragma statements, they 
                        // returns an array.
                        db.__data = res.map(row => {
                            return Object.assign({}, row);
                        });
                    } else {
                        // Deal with other statements like insert/update/
                        // delete.
                        db.insertId = res.insertId;
                        db.affectedRows = res.affectedRows;
                    }
                    resolve(db);
                }
            });
        });
    },
    close(db) {
        db.__connection.connection.destroy();
    },
    ping(db) {
        return new Promise((resolve, reject) => {
            db.__connection.connection.ping(err => {
                err ? reject(err) : resolve(db);
            });
        });
    },
    random(query) {
        query.__orderBy = "rand()";
    }
};