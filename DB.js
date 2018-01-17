const EventEmitter = require("events");
const Adapter = require("./Adapter");
const MysqlAdapter = require("modelar-mysql-adapter");
const PostgresAdapter = require("modelar-postgres-adapter");

/**
 * *Database Manager.*
 * 
 * This class provides an internal pool for connections, when a connection has
 * done its job, it could be recycled and retrieved, there for saving the 
 * resources and speeding up the program.
 */
class DB extends EventEmitter {
    /**
     * Creates a new DB instance with specified configurations.
     * 
     * @param  {string|object}  [config]  An object that carries configurations for 
     *  the current instance, or a string that sets only the database name.
     */
    constructor(config = {}) {
        super();
        if (typeof config == "string")
            config = { database: config };

        this.sql = ""; // The SQL statement the last time execute.
        this.bindings = []; // The binding data the last time execute.

        // The ID returned by executing the last insert statement.
        this.insertId = 0;

        // A count that represents how many records are affected by executing
        // the last SQL statement.
        this.affectedRows = 0;

        // This property carries the last executed SQL command.
        this._command = "";

        // This property indicates whether the transaction is begun or not.
        // this._transaction = false;

        // The data fetched by executing a select statement.
        this._data = [];

        // This object carries database configurations of the current 
        // instance.
        this._config = Object.assign({}, this.constructor._config, config);

        // The data source name of the current instance.
        this._dsn = this._getDSN();

        // Event listeners.
        this._events = Object.assign({}, this.constructor._events);
        this._eventsCount = Object.keys(this._events).length;

        this._adapter = new this.constructor._adapters[this._config.type];
    }

    /** Gets the data source name by the given configuration. */
    _getDSN() {
        var config = this._config,
            dsn = config.type + ":";
        if (config.user || config.host)
            dsn += "//";
        if (config.user) {
            dsn += config.user;
            if (config.password)
                dsn += ":" + config.password;
            dsn += "@";
        }
        if (config.host) {
            dsn += config.host;
            if (config.port)
                dsn += ":" + config.port;
            dsn += "/";
        }
        if (config.database)
            dsn += config.database;
        if (!config.user && config.password)
            dsn += ":" + config.password;
        return dsn;
    }

    /**
     * Adds quote to a specified value.
     * 
     * @param  {any}  value  A value that needs to be quoted.
     * 
     * @return {any} The quoted values.
     */
    quote(value) {
        if (typeof value != "string")
            return value;

        value = value.replace(/\\/g, "\\\\");
        var quote = this._adapter.quote || "'",
            re = new RegExp(quote, "g");
        return quote + value.replace(re, "\\" + quote) + quote;
    }

    /**
     * Adds back-quote to a specified identifier.
     * 
     * @param  {string}  identifier  An identifier (a table name or 
     *  field name) that needs to be quoted.
     * 
     * @return {string} The quoted identifier.
     */
    backquote(identifier) {
        if (typeof identifier !== "string")
            return identifier;

        var parts = identifier.split("."),
            exception = /[~`!@#\$%\^&\*\(\)\-\+=\{\}\[\]\|:"'<>,\?\/\s]/,
            quote;
        if (this._adapter.backquote !== undefined) {
            if (this._adapter.backquote instanceof Array) {
                quote = this._adapter.backquote;
            } else {
                if (this._adapter.backquote.length === 2) {
                    quote = this._adapter.backquote.split("");
                } else {
                    quote = [
                        this._adapter.backquote,
                        this._adapter.backquote
                    ];
                }
            }
        } else {
            quote = ["`", "`"];
        }
        if (parts.length === 1 && !exception.test(identifier)) {
            identifier = quote[0] + identifier + quote[1];
        } else if (parts.length === 2) {
            identifier = this.backquote(parts[0]) + "." +
                this.backquote(parts[1]);
        }
        return identifier;
    }

    /**
     * Initiates the DB class for every instances.
     * 
     * @param  {object}  [config]  An object that carries configurations.
     * 
     * @return {typeof DB} Returns the class itself for function chaining.
     */
    static init(config = {}) {
        // This object carries basic database configurations for every 
        // instance.
        this._config = Object.assign({
            // Database type.
            type: "mysql",
            database: "",
            host: "",
            port: 0,
            user: "",
            password: "",
            // SSL option supports: { rejectUnauthorized, ca, key, cert }
            ssl: null,
            timeout: 5000,
            charset: "utf8",
            max: 50, //  Maximum connection count of the pool.
        }, this._config, config);

        // This property stores all event listeners bound by DB.on().
        if (this._events === undefined)
            this._events = {};

        // This property stores all available adapters.
        if (this._adapters === undefined) {
            this._adapters = {};
            this.setAdapter("mysql", MysqlAdapter)
                .setAdapter("maria", MysqlAdapter)
                .setAdapter("postgres", PostgresAdapter);
        }

        return this;
    }

    /**
     * Binds a listener to an event for all DB instances.
     * 
     * @param  {string|symbol}  event  The event name.
     * 
     * @param  {(...args: any[])=>void}  listener  A function called when the 
     *  event fires.
     * 
     * @return {typeof DB} Returns the class itself for function chaining.
     */
    static on(event, listener) {
        if (this._events[event] instanceof Function) {
            this._events[event] = [this._events[event], listener];
        } else if (this._events[event] instanceof Array) {
            this._events[event].push(listener);
        } else {
            this._events[event] = listener;
        }
        return this;
    }

    /**
     * Sets adapter for a specified database type.
     * 
     * @param  {string}  type  Database type.
     * @param  {typeof Adapter}  adapter  The adapter class.
     * 
     * @return {typeof DB} Returns the class itself for function chaining.
     */
    static setAdapter(type, adapter) {
        adapter = adapter instanceof Adapter ? adapter.constructor : adapter;
        this._adapters[type] = adapter;
        return this;
    }

    /** 
     * An alias of `db.emit()`.
     * @param {string|symbol} event
     * @param {any[]} ...args
     * @return {boolean}
     */
    trigger(event, ...args) {
        return this.emit(event, ...args);
    }

    /**
     * Acquires a connection to the database.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    connect() {
        return this._adapter.connect(this);
    }

    /** An alias of db.connect(). */
    acquire() {
        return this.connect();
    }

    /**
     * Uses a DB instance and share its connection to the database.
     * 
     * @param  {DB}  db  A DB instance that is already created.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    use(db) {
        this._config = db._config;
        this._dsn = db._dsn;
        this._adapter = db._adapter;
        return this;
    }

    /**
     * Executes a SQL statement.
     * 
     * @param  {string}  sql  The SQL statement.
     * 
     * @param  {any[]}  [bindings]  The data bound to the SQL statement, 
     *  pass each one as an argument, or just pass the first one an array.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    query(sql, ...bindings) {
        if (this._adapter.connection === null) {
            return this.connect().then(db => {
                return this.query(sql, ...bindings);
            });
        }

        if (bindings[0] instanceof Array)
            bindings = bindings[0];
        this.sql = sql.trim();
        this.bindings = Object.assign([], bindings);
        var i = this.sql.indexOf(" "),
            command = this.sql.substring(0, i).toLowerCase();
        this._command = command;
        this.emit("query", this);
        return this._adapter.query(this, sql, bindings);
    }

    /**
     * Begins transaction.
     * 
     * @param  {(db: DB)=>Promise<any>}  [callback]  If a function is passed, the code
     *  in it will be automatically handled, that means if the program goes 
     *  well, the transaction will be automatically committed, otherwise it 
     *  will be automatically rolled back. If no function is passed, it just 
     *  begin the transaction, that means you have to commit and roll back 
     *  manually.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    transaction(callback = null) {
        return this._adapter.transaction(this, callback);
    }

    /**
     * Commits the transaction when things going well.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    commit() {
        return this._adapter.commit(this);
    }

    /**
     * Rolls the transaction back when things going wrong.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    rollback() {
        return this._adapter.rollback(this);
    }

    /**
     * Releases the connection.
     * 
     * @param {void}
     */
    release() {
        this._adapter.release();
    }

    /** An alias of db.release(). */
    recycle() {
        return this.release();
    }

    /**
     * Closes the connection.
     * 
     * @return {void}
     */
    close() {
        return this._adapter.close();
    }

    /**
     * Closes all connections in all pools.
     * 
     * @return {void}
     */
    static close() {
        for (let i in this._adapters) {
            this._adapters[i].close();
        }
    }

    /** An alias of DB.close(). */
    static destroy() {
        return this.close();
    }
}

DB.init(); // Initiate configurations.

module.exports = DB;

// Prepare for Modelar 3.0.
Object.defineProperties(DB.prototype, {
    dsn: {
        get() {
            return this._dsn;
        },
        set(v) {
            this._dsn = v;
        }
    },

    command: {
        get() {
            return this._command;
        },
        set(v) {
            this._command = v;
        }
    },

    config: {
        get() {
            return this._config;
        },
        set(v) {
            this._config = v;
        }
    },

    data: {
        get() {
            return this._data;
        },
        set(v) {
            this._data = v;
        }
    }
});