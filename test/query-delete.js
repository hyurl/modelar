const assert = require("assert");
const { DB, Query } = require("../");

describe("Query.prototype.delete()", () => {
    it("should delete the user as expected", (done) => {
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
            return query2.where("id", query.insertId).delete();
        }).then(() => {
            assert.equal(query2.sql, "delete from `users` where `id` = ?");
            assert.deepEqual(query2.bindings, [query.insertId]);
            assert.equal(query2.affectedRows, 1);
        }).then(() => db.close()).then(done).catch((err) => {
            db.close();
            done(err);
        });
    });
});