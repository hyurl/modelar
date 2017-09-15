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
     * Creates a new instance with specified configurations.
     * 
     * @param  {Object} config An object that carries configurations for the 
     *                         current instance, or a string that sets only 
     *                         the database name.
     */
    constructor(config = {}) {
        if (typeof config == 'string')
            config = { database: config };

        this.sql = ''; //The SQL statement the last time execute.
        this.bindings = []; //The binding data the last time execute.

        //The ID returned by executing the last insert statement.
        this.insertId = 0;

        //A count that represents how many records are affected by executing
        //the last SQL statement.
        this.affectedRows = 0;

        //The data fetched by executing a select statement.
        this.__data = [];

        //This object stores database configurations of the current instance.
        this.__config = Object.assign({}, this.constructor.__config, config);

        //The connection specification of the current instance.
        this.__spec = this.__getSpec();

        //The database connection of the current instance.
        this.__connection = null;

        //Event handlers.
        this.__events = Object.assign({
            //This event will be fired when a SQL statement has been 
            //successfully executed.
            query: [],
        }, this.constructor.__events);
    }

    /** Gets the connect specification by the given configuration. */
    __getSpec() {
        var config = this.__config;
        if (config.type == 'sqlite') { //SQLite
            return config.type + ':' + config.database;
        } else if (config.type == 'mysql') { //MySQL
            return config.type + ':' + config.user + ':' + config.password +
                '@' + config.host + ':' + config.port +
                (config.database ? '/' + config.database : '');
        }
    }

    /** Adds quote to a specified value. */
    __quote(value) {
        return "'" + value.replace(/'/g, "\\'") + "'";
    }

    /** Adds back-quote to a specified field. */
    __backquote(field) {
        var parts = field.split(".");
        if (field.indexOf(" ") < 0 && field.indexOf("(") < 0 &&
            field.indexOf("`") < 0 && field != "*" && parts.length === 1) {
            field = "`" + field + "`";
        } else if (parts.length === 2) {
            field = "`" + parts[0] + "`.`" + parts[1] + "`";
        }
        return field;
    }

    /**
     * Initiate the DB class for every instances.
     * 
     * @param  {Object} config An object that carries configurations.
     * 
     * @return {DB} Returns the class itself for function chaining.
     */
    static init(config = {}) {
        //This object stores basic database configurations for every instance.
        this.__config = Object.assign({
            type: 'mysql', //Database type, accept 'mysql' and 'sqlite'.
            database: '',
            //These properties are only for MySQL:
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            charset: 'utf8',
            timeout: 5000, //This property sets both connecting timeout and 
            //query timeout.
        }, this.__config || {}, config);

        //This property carries all event handlers bound by DB.on().
        this.__events = Object.assign({}, this.__events || {});

        //This property stores those connections that are recycled by calling
        //db.recycle(), which means they're released and can be reused again. 
        //When the next time trying to connect a database, the program will 
        //firstly trying to retrieve a connection from this property, if no 
        //connections are available, a new one will be created.
        this.__pool = {};

        return this;
    }

    /**
     * Binds an event handler to all DB instances.
     * 
     * @param  {String}   event    The event name.
     * @param  {Function} callback A function called when the event fires, 
     *                             it accepts one argument, which is a new DB 
     *                             instance.
     * 
     * @return {DB} Returns the class itself for function chaining.
     */
    static on(event, callback) {
        // this.__events = this.__events || {};
        if (this.__events[event] === undefined)
            this.__events[event] = [];
        this.__events[event].push(callback);
        return this;
    }

    /**
     * Binds an event handler to a particular instance.
     * 
     * @param  {String}   event    The event name.
     * @param  {Function} callback A function called when the event fires,
     *                             it accepts one argument, which is the 
     *                             current instance.
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
     * @param  {String} event The event name.
     * @param  {Any}    args  Arguments passed to event handlers.
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
     * Make a connection to the database. This method will automatically check 
     * the connection pool, if there are connections available in the pool, 
     * the first one will be retrieved; if no connections are available, a new
     * one will be established.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    connect() {
        var config = this.__config;
        var connections = DB.__pool;
        if (connections[this.__spec] && connections[this.__spec].length > 0) {
            //If has available connections, retrieve the first one.
            this.__connection = connections.shift();
        } else {
            if (config.type == 'sqlite') { //SQLite
                var driver = require('sqlite3'); //Import SQLite.
                this.__connection = new driver.Database(config.database);
            } else if (config.type == 'mysql') { //MySQL
                var driver = require('mysql'); //Import MySQL.
                this.__connection = driver.createConnection({
                    host: config.host,
                    port: config.port,
                    user: config.user,
                    password: config.password,
                    database: config.database,
                    charset: config.charset,
                    connectTimeout: config.timeout,
                });
                this.__connection.connect();
            }
        }
        return this;
    }

    /**
     * Uses a connection that is already established.
     * 
     * @param {Object} db An DB instance with a established connection.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    use(db) {
        this.__config = db.__config;
        this.__spec = db.__spec;
        this.__connection = db.__connection;
        return this;
    }

    /**
     * Executes a SQL statement.
     * 
     * @param  {String}  sql      The SQL statement.
     * @param  {Array}   bindings [optional] The data bound to the SQL 
     *                            statement.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    query(sql, bindings = []) {
        this.sql = sql.toLowerCase().trim();
        this.bindings = Object.assign([], bindings);
        return new Promise((resolve, reject) => {
            if (this.__connection === null) {
                //If connection isn't established, connect automatically.
                this.connect();
            }
            //Fire event and trigger event handlers.
            this.trigger('query', this);

            if (this.__config.type == 'sqlite') { //SQLite
                var _this = this,
                    begin = this.sql.substring(0, this.sql.indexOf(" ")),
                    gets = ['select', 'pragma'];
                if (gets.includes(begin)) {
                    //Deal with select or pragma statements.
                    this.__connection.all(sql, bindings, function(err, rows) {
                        if (err) {
                            reject(err);
                        } else {
                            _this.__data = rows;
                            //Fire event and trigger event handlers.
                            // _this.trigger('query', _this);
                            resolve(_this);
                        }
                    });
                } else {
                    //Deal with other statements like insert/update/delete.
                    this.__connection.run(sql, bindings, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            _this.insertId = this.lastID;
                            _this.affectedRows = this.changes;
                            //Fire event and trigger event handlers.
                            // _this.trigger('query', _this);
                            resolve(_this);
                        }
                    });
                }
            } else if (this.__config.type == 'mysql') { //MySQL
                this.__connection.query({
                    sql: sql,
                    timeout: this.__config.timeout,
                    values: bindings,
                }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (res instanceof Array) {
                            //Deal with select or pragma statements, they 
                            //returns an array.
                            this.__data = res;
                        } else {
                            //Deal with other statements like insert/update/
                            //delete.
                            this.insertId = res.insertId;
                            this.affectedRows = res.affectedRows;
                        }
                        //Fire event and trigger event handlers.
                        // this.trigger('query', this);
                        resolve(this);
                    }
                });
            }
        });
    }

    /** An alias of query(). */
    run(sql, bindings) {
        return this.query(sql, bindings);
    }

    /**
     * Starts a transaction and handle codes in it.
     * 
     * @param {Function} callback If a function is passed, the codes in it 
     *                            will be automatically handled, that means 
     *                            if the program goes well, the transaction 
     *                            will be automatically committed, otherwise 
     *                            it will automatically roll backed. If no 
     *                            function is passed, it just start the 
     *                            transaction, that means you have to commit 
     *                            and roll back manually.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    transaction(callback = null) {
        if (typeof callback == 'function') {
            return this.query('begin').then(db => {
                return callback.call(db, db);
            }).then(db => {
                this.commit();
                return db;
            }).catch(err => {
                this.rollback();
                throw err;
            });
        } else {
            return this.query('begin');
        }
    }

    /** Commits the transaction when things going well. */
    commit() {
        return this.query('commit');
    }

    /** Rolls the transaction back when things going not well. */
    rollback() {
        return this.query('rollback');
    }

    /**
     * Closes the connection that current instance holds.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    close() {
        if (this.__config.type == 'sqlite') //SQLite
            this.__connection.close();
        else if (this.__config.type == 'mysql') //MySQL
            this.__connection.destroy();

        //Remove the connection reference.
        this.__connection = null;
        return this;
    }

    /**
     * Recycles the connection that current instance holds.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    recycle() {
        var connections = DB.__pool[this.__spec];
        if (!connections)
            connections = [];
        connections.push(this.connection);
        this.__connection = null;
        return this;
    }

    /**
     * Destroys all recycled connections that DB holds.
     * 
     * @return {DB} Returns the class itself for function chaining.
     */
    static destroy() {
        for (let spec in this.__pool) {
            if (this.__pool[spec] instanceof Array) {
                for (let connection of this.__pool[spec]) {
                    if (typeof connection.destroy == 'function') //MySQL
                        connection.destroy();
                    else if (typeof connection.close == 'function') //SQLite
                        connection.close();
                    else
                        connection = null;
                }
            }
            delete this.__pool[spec]; //Remove the connection reference.
        }
        return this;
    }
}

DB.init(); //Initiate configuration.

module.exports = DB;