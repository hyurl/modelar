const assert = require("assert");
const { DB } = require("../");

describe("DB.prototype.transaction()", () => {
    it("should sequentially run the SQLs in a transaction as expected", (done) => {
        let config = {
            type: "mysql",
            database: "modelar",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "161301"
        };

        let db = new DB(config),
            insertId = 0,
            insertion = {
                sql: "insert into `users` (`name`, `email`, `password`) values (?, ?, ?)",
                bindings: ["Ayon Lee", "i@hyurl.com", "12345"],
            },
            selection = {
                sql: "select * from `users` where `id` = ?",
                bindings: [0],
            },
            update = {
                sql: "update `users` set `name` = ?, `email` = ? where id = ?",
                bindings: ["Ayonium", "ayon@hyurl.com", 0],
            },
            replaceQuestionMark = (sql, bindings) => {
                for (let data of bindings) {
                    sql = sql.replace("?", typeof data == "string" ? `'${data}'` : data);
                }

                return sql;
            };

        db.transaction((db) => {
            // this query will be committed.
            return db.query(insertion.sql, insertion.bindings).then(db => {
                assert(typeof db.insertId == "number" && db.insertId > 0);
                assert.equal(replaceQuestionMark(db.sql, db.bindings), replaceQuestionMark(insertion.sql, insertion.bindings));

                insertId = selection.bindings[0] = update.bindings[2] = db.insertId;

                return db;
            });
        }).then(db => {
            return db.query(selection.sql, selection.bindings).then(() => {
                assert(Array.isArray(db.data) && db.data.length == 1);
                assert.equal(typeof db.data[0].id, "number");
                assert.deepStrictEqual({
                    id: db.data[0].id,
                    name: db.data[0].name,
                    email: db.data[0].email,
                    password: db.data[0].password
                }, {
                        id: insertId,
                        name: insertion.bindings[0],
                        email: insertion.bindings[1],
                        password: insertion.bindings[2]
                    });

                return db;
            });
        }).then(db => {
            return db.transaction(() => {
                // this query will be rolled back since an error occurred.
                return db.query(update.sql, update.bindings).then(() => {
                    throw new Error("This error prevent committing the query.");
                });
            }).catch((err) => {
                return db.query(selection.sql, selection.bindings).then(() => {
                    db.close();

                    assert(Array.isArray(db.data) && db.data.length == 1);
                    assert.equal(typeof db.data[0].id, "number");
                    assert.deepStrictEqual({
                        id: db.data[0].id,
                        name: db.data[0].name,
                        email: db.data[0].email,
                        password: db.data[0].password
                    }, {
                            id: insertId,
                            name: insertion.bindings[0],
                            email: insertion.bindings[1],
                            password: insertion.bindings[2]
                        });

                    return db;
                });
            });
        }).then(db => db.close()).then(done).catch(done);
    });
});