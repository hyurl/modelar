const assert = require("assert");
const { DB, Query } = require("../");

describe("Query.prototype.update()", () => {
    it("should update data as expected", (done) => {
        let db = new DB({
            type: "mysql",
            database: "modelar",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "161301"
        });
        let query = new Query("users").use(db),
            query2 = new Query("users").use(db);

        query.insert({
            name: "Ayon Lee",
            email: "i@hyurl.com",
            password: "123456"
        }).then(() => {
            return query2.where("id", query.insertId).update({
                name: "Ayonium",
                email: "ayon@hyurl.com"
            });
        }).then(() => {
            assert.equal(query2.sql, "update `users` set `name` = ?, `email` = ? where `id` = ?");
            assert.deepEqual(query2.bindings, ["Ayonium", "ayon@hyurl.com", query.insertId]);
            assert.equal(query2.affectedRows, 1);
        }).then(() => db.close()).then(done).catch(err => {
            db.close();
            done(err);
        });
    });
});

describe("Query.prototype.increase()", () => {
    describe("increase(field: string, step?: number)", () => {
        it("should increase the user age as expected", (done) => {
            let db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            let query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);
    
            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
            }).then(() => {
                return query2.where("id", query.insertId).increase("age");
            }).then(() => {
                assert.equal(query2.sql, "update `users` set `age` = `age` + ? where `id` = ?");
                assert.deepEqual(query2.bindings, [1, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(() => {
                return query3.where("id", query.insertId).increase("age", 5);
            }).then(() => {
                assert.equal(query3.sql, "update `users` set `age` = `age` + ? where `id` = ?");
                assert.deepEqual(query3.bindings, [5, query.insertId]);
                assert.equal(query3.affectedRows, 1);
            }).then(() => db.close()).then(done).catch(err => {
                db.close();
                done(err);
            });
        });
    });

    describe("increase(fields: { [field: string]: number })", () => {
        it("should increase the user age and score as expected", (done) => {
            let db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            let query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);
    
            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 60
            }).then(() => {
                return query2.where("id", query.insertId).increase({
                    age: 5,
                    score: 20
                });
            }).then(() => {
                assert.equal(query2.sql, "update `users` set `age` = `age` + ?, `score` = `score` + ? where `id` = ?");
                assert.deepEqual(query2.bindings, [5, 20, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(() => db.close()).then(done).catch(err => {
                db.close();
                done(err);
            });
        });
    });
});

describe("Query.prototype.decrease()", () => {
    describe("decrease(field: string, step?: number)", () => {
        it("should decrease the user age and score as expected", (done) => {
            let db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            let query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);
    
            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
            }).then(() => {
                return query2.where("id", query.insertId).decrease("age");
            }).then(() => {
                assert.equal(query2.sql, "update `users` set `age` = `age` - ? where `id` = ?");
                assert.deepEqual(query2.bindings, [1, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(() => {
                return query3.where("id", query.insertId).decrease("age", 5);
            }).then(() => {
                assert.equal(query3.sql, "update `users` set `age` = `age` - ? where `id` = ?");
                assert.deepEqual(query3.bindings, [5, query.insertId]);
                assert.equal(query3.affectedRows, 1);
            }).then(() => db.close()).then(done).catch(err => {
                db.close();
                done(err);
            });
        });
    });

    describe("decrease(fields: { [field: string]: number })", () => {
        it("should decrease the user age as expected", (done) => {
            let db = new DB({
                type: "mysql",
                database: "modelar",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "161301"
            });
            let query = new Query("users").use(db),
                query2 = new Query("users").use(db),
                query3 = new Query("users").use(db);
    
            query.insert({
                name: "Ayon Lee",
                email: "i@hyurl.com",
                password: "123456",
                age: 20,
                score: 60
            }).then(() => {
                return query2.where("id", query.insertId).decrease({
                    age: 5,
                    score: 20
                });
            }).then(() => {
                assert.equal(query2.sql, "update `users` set `age` = `age` - ?, `score` = `score` - ? where `id` = ?");
                assert.deepEqual(query2.bindings, [5, 20, query.insertId]);
                assert.equal(query2.affectedRows, 1);
            }).then(() => db.close()).then(done).catch(err => {
                db.close();
                done(err);
            });
        });
    });
});