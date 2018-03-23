class Adapter {
    constructor() {
        this.connection = null;
        this.quote = "'";
        this.backquote = "`";
    }

    /** Methods for DB */

    /**
     * Connects to the database.
     * @param  {DB} db A modelar DB instance.
     * @return {DB} Return the input db.
     */
    connect(db) {
        throw new Error("Must be implemented first!");
    }

    /**
     * Runs a SQL statement.
     * @param  {DB} db
     * @param  {string} sql
     * @param  {any[]} bindings
     * @return {DB}
     */
    query(db, sql, bindings = []) {
        throw new Error("Must be implemented first!");
    }

    /**
     * Releases the connection.
     * @return {void}
     */
    release() {
        throw new Error("Must be implemented first!");
    }

    /**
     * Closes the connection.
     * @return {void}
     */
    close() {
        throw new Error("Must be implemented first!");
    }

    /**
     * Closes all connections in the pool.
     * @return {void}
     */
    static close() {
        throw new Error("Must be implemented first!");
    }

    /**
     * Begins a transaction.
     * @param  {DB} db
     * @param  {(db: DB)=>Promise<any>} callback
     * @return {DB}
     */
    transaction(db, callback = null) {
        if (typeof callback == "function") {
            return this.query(db, "begin").then(db => {
                var res = callback.call(db, db);
                if (res.then instanceof Function) {
                    return res.then(() => db);
                } else {
                    return db;
                }
            }).then(db => {
                return this.commit(db);
            }).catch(err => {
                return this.rollback(db).then(db => {
                    throw err;
                });
            });
        } else {
            return this.query(db, "begin");
        }
    }

    /**
     * Commits a transaction.
     * @param  {DB} db
     * @return {DB}
     */
    commit(db) {
        return this.query(db, "commit");
    }

    /**
     * Rolls back a transaction.
     * @param  {DB} db
     * @return {DB}
     */
    rollback(db) {
        return this.query(db, "rollback");
    }

    /** Methods for Table */

    /**
     * Gets the DDL statement.
     * @param  {Table} table
     * @return {string}
     */
    getDDL(table) {
        throw new Error("Must be implemented first!");
    }
}

exports.Adapter = Adapter;