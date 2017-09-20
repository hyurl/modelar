"use strict";

/**
 * *Database Connection Manager.*
 * 
 * This class provides an internal pool for connections, when a connection has
 * done its job, it could be recycled and retrieved, there for saving the 
 * resources and speeding up the program.
 */
class DB {
    /**
     * Creates a new DB instance with specified configurations.
     * 
     * @param  {Object}  config  An object that carries configurations for the
     *  current instance, or a string that sets only the database name.
     */
    constructor(config = {}) {
        if (typeof config == "string")
            config = { database: config };

        this.sql = ""; //The SQL statement the last time execute.
        this.bindings = []; //The binding data the last time execute.

        //The ID returned by executing the last insert statement.
        this.insertId = 0;

        //A count that represents how many records are affected by executing
        //the last SQL statement.
        this.affectedRows = 0;

        //This property carries the last executed SQL command.
        this.__command = "";

        //This property indicates whether the transaction is begun or not.
        this.__transaction = false;

        //The data fetched by executing a select statement.
        this.__data = [];

        //This object carries database configurations of the current instance.
        this.__config = Object.assign({}, this.constructor.__config, config);

        //The connection specification of the current instance.
        this.__spec = this.__getSpec();

        //The database connection of the current instance.
        this.__connection = {
            active: false, //The state of connection, true means available.
            connection: null //The real connection.
        };

        //Event handlers.
        this.__events = Object.assign({
            //This event will be fired when a SQL statement is about to be
            //executed.
            query: [],
        }, this.constructor.__events);

        //Reference to the driver.
        var dirver = this.constructor.__drivers[this.__config.type];
        this.__driver = require(dirver);
    }

    /** Gets the connect specification by the given configuration. */
    __getSpec() {
        var config = this.__config,
            spec = config.type + "://";
        if (config.user)
            spec += config.user + ":";
        if (config.password)
            spec += config.password + "@";
        if (config.host)
            spec += config.host + ":";
        if (config.port)
            spec += config.port + "/";
        if (config.database)
            spec += config.database;
        return spec;
    }

    /**
     * Adds quote to a specified value.
     * 
     * @param  {String|Number}  value  A value that needs to be quoted.
     * 
     * @return {String|Number} The quoted values.
     */
    quote(value) {
        var quote = this.__driver.quote || "'";
        if (typeof value == "number" || value === null)
            return value;
        value = value.replace(/\\/g, "\\\\");
        var re = new RegExp(quote, "g");
        return quote + value.replace(re, "\\" + quote) + quote;
    }

    /**
     * Adds back-quote to a specified identifier.
     * 
     * @param  {String|Number}  identifier  An identifier (a table name or 
     *  field name) that needs to be quoted.
     * 
     * @return {String|Number} The quoted identifier.
     */
    backquote(identifier) {
        //PostgreSQL uses double-quote while others use back-quote.
        var quote = this.__driver.backquote || "`",
            parts = identifier.split(".");
        if (identifier.indexOf(" ") < 0 && identifier.indexOf("(") < 0 &&
            identifier.indexOf(quote) < 0 && identifier != "*" &&
            parts.length === 1) {
            identifier = quote + identifier + quote;
        } else if (parts.length === 2) {
            identifier = this.backquote(parts[0]) + "." +
                this.backquote(parts[1]);
        }
        return identifier;
    }

    /**
     * Initiate the DB class for every instances.
     * 
     * @param  {Object}  config  An object that carries configurations.
     * 
     * @return {DB} Returns the class itself for function chaining.
     */
    static init(config = {}) {
        //This object carries basic database configurations for every 
        //instance.
        this.__config = Object.assign({
            //Database type, A.K.A the driver name.
            type: "sqlite",
            database: "",
            //These properties are only for datbase servers:
            host: "",
            port: 0,
            user: "",
            password: "",
            //SSL option supports: { rejectUnauthorized, ca, key, cert }
            ssl: null,
            timeout: 5000,
            charset: "utf8",
        }, this.__config || {}, config);

        //This property carries all event handlers bound by DB.on().
        this.__events = Object.assign({}, this.__events || {});

        //This property carries drivers names and their locations.
        this.__drivers = {
            sqlite: "./drivers/sqlite.js",
            mysql: "./drivers/mysql.js",
            postgres: "./drivers/postgres.js",
        };

        //This property stores those connections that are recycled by calling
        //db.recycle(), which means they're released and can be reused again. 
        //When the next time trying to connect a database, the program will 
        //firstly trying to retrieve a connection from this property, if no 
        //connections are available, a new one will be created.
        DB.__pool = {};

        return this;
    }

    /**
     * Binds an event handler to all DB instances.
     * 
     * @param  {String}  event  The event name.
     * 
     * @param  {Function}  callback  A function called when the event fires, 
     *  it accepts one argument, which is a new DB instance.
     * 
     * @return {DB} Returns the class itself for function chaining.
     */
    static on(event, callback) {
        if (this.__events[event] === undefined)
            this.__events[event] = [];
        this.__events[event].push(callback);
        return this;
    }

    /**
     * Binds an event handler to a particular instance.
     * 
     * @param  {String}  event  The event name.
     * 
     * @param  {Function}  callback  A function called when the event fires,
     *  it accepts one argument, which is the current instance.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    on(event, callback) {
        if (this.__events[event] === undefined)
            this.__events[event] = [];
        this.__events[event].push(callback);
        return this;
    }

    /**
     * Fires an event and triggers its handlers.
     * 
     * @param  {String}  event  The event name.
     * 
     * @param  {Array}  args  Arguments passed to event handlers.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    trigger(event, ...args) {
        if (this.__events[event] instanceof Array) {
            for (let callback of this.__events[event]) {
                callback.apply(this, args);
            }
        } else if (this.__events[event] instanceof Function) {
            this.__events[event].apply(this, args);
        }
        return this;
    }

    /**
     * Makes a connection to the database. This method will automatically 
     * check the pool, if there are connections available in the pool, 
     * the first one will be retrieved; if no connections are available, a new
     * one will be established.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    connect() {
        var config = this.__config;
        if (DB.__pool[this.__spec] && DB.__pool[this.__spec].length > 0) {
            //If has available connections, retrieve and use the first one.
            return new Promise((resolve, reject) => {
                var db = DB.__pool[this.__spec].shift();
                this.__connection.connection = db.__connection.connection;
                resolve(this);
            }).then(db => {
                if (this.__driver.ping instanceof Function) {
                    //Ping the database server, make sure the connection is
                    //alive.
                    return this.__driver.ping(this).then(db => {
                        this.__connection.active = true;
                        return this;
                    });
                } else {
                    this.__connection.active = true;
                    return this;
                }
            });
        } else {
            return this.__driver.connect(this).then(db => {
                this.__connection.active = true;
                return this;
            });
        }
        return this;
    }

    /**
     * Uses a DB instance and share its connection to the database. If use 
     * this method, call it right after creating the instance.
     * 
     * @param  {DB}  db  A DB instance that is already created.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    use(db) {
        this.__config = db.__config;
        this.__spec = db.__spec;
        this.__driver = db.__driver;
        //Make a reference to the connection, this action will affect all
        //DB instances.
        this.__connection = db.__connection;
        return this;
    }

    /**
     * Executes a SQL statement.
     * 
     * @param  {String}  sql  The SQL statement.
     * 
     * @param  {Array}  bindings  [optional] The data bound to the SQL 
     *  statement.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    query(sql, bindings = []) {
        this.sql = sql.trim();
        this.bindings = Object.assign([], bindings);
        var i = this.sql.indexOf(" ");
        this.__command = this.sql.substring(0, i).toLowerCase();
        if (this.__command == "begin") {
            this.__transaction = true;
        } else if (this.__command == "commit" || this.__command == "rollback") {
            this.__transaction = false;
        }
        if (this.__connection.active === false) {
            //If connection isn't established, connect automatically.
            return this.connect().then(db => {
                //Fire event and trigger event handlers.
                this.trigger("query", this);
                return this.__driver.query(this, sql, bindings);
            });
        } else {
            this.trigger("query", this);
            return this.__driver.query(this, sql, bindings);
        }
    }

    /**
     * Starts a transaction and handle actions in it.
     * 
     * @param  {Function}  callback  If a function is passed, the code in it 
     *  will be automatically handled, that means if the program goes well, 
     *  the transaction will be automatically committed, otherwise it will be 
     *  automatically rolled back. If no function is passed, it just start the
     *  transaction, that means you have to commit and roll back manually.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    transaction(callback = null) {
        if (this.__driver.transaction instanceof Function) {
            return this.__driver.transaction(this, callback);
        } else {
            if (typeof callback == "function") {
                return this.query("begin").then(db => {
                    return callback.call(db, db);
                }).then(db => {
                    this.commit();
                    return this;
                }).catch(err => {
                    this.rollback();
                    throw err;
                });
            } else {
                return this.query("begin");
            }
        }
    }

    /**
     * Commits the transaction when things going well.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    commit() {
        if (this.__driver.commit instanceof Function)
            return this.__driver.commit(this);
        return this.query("commit");
    }

    /**
     * Rolls the transaction back when things going not well.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    rollback() {
        if (this.__driver.rollback instanceof Function)
            return this.__driver.rollback(this);
        return this.query("rollback");
    }

    /**
     * Closes the connection that current instance holds.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    close() {
        if (this.__driver.close instanceof Function &&
            this.__connection.active) {
            this.__driver.close(this);
        }
        //Remove the connection reference, this action will affect all
        //DB instances.
        this.__connection.active = false;
        this.__connection.connection = null;
        return this;
    }

    /**
     * Recycles the connection that current instance holds.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    recycle() {
        if (this.__transaction) {
            //If the transaction is opened but not committed, rollback.
            this.rollback();
        }
        if (DB.__pool[this.__spec] === undefined)
            DB.__pool[this.__spec] = [];
        if (this.__connection.active) {
            //Create a new instance.
            var db = new DB(this.__config);
            //Redefine the property so when removing the connection reference,
            //This instance won't be affected.
            db.__connection = {
                active: false,
                connection: this.__connection.connection
            };
            DB.__pool[this.__spec].push(db);
        }
        //Remove the connection reference, this action will affect all
        //DB instances.
        this.__connection.active = false;
        this.__connection.connection = null;
        return this;
    }

    /**
     * Destroys all recycled connections that DB holds.
     * 
     * @return {DB} Returns the class itself for function chaining.
     */
    static destroy() {
        for (let spec in DB.__pool) {
            if (DB.__pool[spec] instanceof Array) {
                for (let db of DB.__pool[spec]) {
                    db.close();
                }
            }
            delete DB.__pool[spec]; //Remove the connection reference.
        }
        return this;
    }
}

DB.init(); //Initiate configuration.

module.exports = DB;