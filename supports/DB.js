/**
 * Database Connection Manager.
 * 
 * This class holds connections by their specifications, when initiate a new 
 * instance, it will check if there is already an existing one, if there is, 
 * it will be used instead of creating a new one, this feature guarantees 
 * there will be only one connection to the same database.
 */
class DB{
    /**
     * Creates a new instance with specified configurations.
     * 
     * @param  {Object} config An object that carries configurations for the 
     *                         current instance, or a string that sets only 
     *                         the database name.
     */
    constructor(config = {}){
        if(typeof config == 'string')
            config = {database: config};
        
        this.sql = ''; //The SQL statement the last time execute.
        this.bindings = []; //The binding data the last time execute.

        //Connection state:
        //0: not connected;
        //1: connecting;
        //2: connected;
        //3: closed.
        this.status = 0;

        //A count that represents how many queries has been executed.
        this.queries = 0;

        //The ID returned by executing the last insert statement.
        this.insertId = 0;

        //A count that represents how many records are affected by executing
        //the last SQL statement.
        this.affectedRows = 0;

        //The data fetched by executing a select statement.
        this.__data = [];

        //This Object stores database configurations of the current instance.
        this.__config = Object.assign({}, this.constructor.__config, config);
        
        //The connection specification of the current instance.
        this.__spec = this.constructor.__getSpec(this.__config);
        
        //The database connection of the current instance.
        this.__connection = null;

        //Event handlers.
        this.__events = Object.assign({
            query: [], //This event will be fired when a SQL statement has 
                       //been successfully executed.
        }, this.constructor.__events);

        if(this.__config.autoConnect)
            this.connect(); //Establish the connection.
    }

    /**
     * Sets global DB configurations for every DB instance.
     * 
     * @param  {Object} config An Object that carries configurations.
     * 
     * @return {DB} Returns DB class itself for function chaining.
     */
    static config(config){
        //This Object stores basic database configurations for every instance.
        this.__config = Object.assign({
            type: 'mysql', //Database type.
            autoConnect: false, //Automatically establish connection after 
                                //creating an instance.
            //These properties are only for MySQL:
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: '',
            charset: 'utf8',
            timeout: 5000, //This property sets both connecting timeout and 
                           //query timeout.
        }, this.__config || {}, config);
        
        //These properties represents the connection state.
        this.UNOPEN = 0;
        this.OPENING = 1;
        this.OPEN = 2;
        this.CLOSED = 3;

        //The property records how many queries has been executed by all DB
        //instances.
        this.queries = 0;

        //This property carries all connections created by every DB instance.
        this.__connections = {};

        //This property carries all event handlers bound by DB.on().
        this.__events = Object.assign({}, this.constructor.__events);
        
        return this;
    }

    /**
     * Uses an existing connection that is already established.
     * 
     * @param  {Object} connection An established connection.
     * 
     * @return {DB} Returns DB class itself for function chaining.
     */
    static use(connection){
        var spec = this.__getSpec(this.__config);
        this.__connections[spec] = connection;
        return this;
    }

    /** Gets the connect specification by the given configuration. */
    static __getSpec(config){
        if(config.type == 'sqlite'){ //SQLite
            return config.type+':'+config.database;
        }else if(config.type == 'mysql'){ //MySQL
            return config.type+':'+config.user+':'+config.password+'@'
                              +config.host+':'+config.port
                              +(config.database ? '/'+config.database : '');
        }
    }

    /**
     * Binds an event handler to all DB instances.
     * 
     * @param  {String}   event    The event name.
     * @param  {Function} callback A function called when the event fires.
     * 
     * @return {DB} Returns DB class itself for function chaining.
     */
    static on(event, callback){
        // this.__events = this.__events || {};
        if(this.__events[event] === undefined)
            this.__events[event] = [];
        this.__events[event].push(callback);
        return this;
    }

    /**
     * Binds an event handler to a particular instance.
     * 
     * @param  {String}   event    The event name.
     * @param  {Function} callback A function called when the event fires.
     * 
     * @return {DB}  Returns the current instance for function chaining.
     */
    on(event, callback){
        if(this.__events[event] === undefined)
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
    trigger(event, ...args){
        if(this.__events[event] instanceof Array){
            for(var callback of this.__events[event]){
                callback.apply(this, args);
            }
        }else if(this.__events[event] instanceof Function){
            this.__events[event].apply(this, args);
        }
        return this;
    }

    /**
     * Establish connection to the database.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    connect(){
        var config = this.__config;
        var connections = this.constructor.__connections;
        if(connections[this.__spec]){
            //If the connection is already established, use it.
            this.__connection = connections[this.__spec];
        }else{
            this.status = 1;
            var callback = (err)=>{
                this.status = err ? 0 : 2;
                if(!err) //Store the connection in global.
                    connections[this.__spec] = this.__connection;
            };
            if(config.type == 'sqlite'){ //SQLite
                var driver = require('sqlite3'); //Import SQLite.
                this.__connection = new driver.Database(
                    config.database, 
                    callback
                );
            }else if(config.type == 'mysql'){ //MySQL
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
                this.__connection.connect(callback);
            }
        }
        return this;
    }

    /**
     * Executing a SQL statement.
     * 
     * @param  {String}  sql      The SQL statement.
     * @param  {Array}   bindings The data bound to the SQL statement.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    query(sql, bindings = []){
        this.sql = sql.toLowerCase().trim();
        this.bindings = Object.assign([], bindings);
        
        //Record query counts.
        this.queries += 1;
        this.constructor.queries += 1;
        DB.queries += 1;

        return new Promise((resolve, reject)=>{
            if(this.__connection === null){
                //If connection isn't established, connect automatically.
                this.connect();
            }

            if(this.__config.type == 'sqlite'){ //SQLite
                var _this = this,
                    begin = this.sql.substring(0, this.sql.indexOf(" ")),
                    gets = ['select', 'pragma'];
                if(gets.includes(begin)){
                    //Deal with select or pragma statements.
                    this.__connection.all(sql, bindings, function(err, rows){
                        if(err){
                            reject(err);
                        }else{
                            _this.__data = rows;
                            //Fire event and trigger event handlers.
                            _this.trigger('query', _this);
                            resolve(_this);
                        }
                    });
                }else{
                    //Deal with other statements like insert/update/delete.
                    this.__connection.run(sql, bindings, function(err){
                        if(err){
                            reject(err);
                        }else{
                            _this.insertId = this.lastID;
                            _this.affectedRows = this.changes;
                            //Fire event and trigger event handlers.
                            _this.trigger('query', _this);
                            resolve(_this);
                        }
                    });
                }
            }else if(this.__config.type == 'mysql'){ //MySQL
                this.__connection.query({
                    sql: sql,
                    timeout: this.__config.timeout,
                    values: bindings,
                }, (err, res)=>{
                    if(err){
                        reject(err);
                    }else{
                        if(res instanceof Array){
                            //Deal with select or pragma statements, they 
                            //returns an Array.
                            this.__data = res;
                        }else{
                            //Deal with other statements like insert/update/
                            //delete.
                            this.insertId = res.insertId;
                            this.affectedRows = res.affectedRows;
                        }
                        //Fire event and trigger event handlers.
                        this.trigger('query', this);
                        resolve(this);
                    }
                });
            }
        });
    }

    /** An alias of query(). */
    run(sql, bindings){
        return this.query(sql, bindings);
    }

    /**
     * Starts a transaction and handle what's in it.
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
    transaction(callback = null){
        if(typeof callback == 'function'){
            return this.query('begin').then(()=>{
                callback.call(this, this);
            }).then(()=>{
                this.commit();
            }).catch(err=>{
                this.rollback();
                throw err;
            });
        }else{
            return this.query('begin');
        }
    }

    /** Commits the transaction when things going well. */
    commit(){
        return this.query('commit');
    }

    /** Rolls the transaction back when things going not well. */
    rollback(){
        return this.query('rollback');
    }

    /**
     * Closes the connection the current instance holds.
     * 
     * @return {DB} Returns the current instance for function chaining.
     */
    close(){
        this.status = 3;
        if(this.__config.type == 'sqlite') //SQLite
            this.__connection.close();
        else if(this.__config.type == 'mysql') //MySQL
            this.__connection.destroy();
        
        //Remove the connection quote.
        this.__connection = null;
        delete this.constructor.__connections[this.__spec];
        return this;
    }

    /**
     * Closes all the connections that DB holds.
     * 
     * @return {DB} Returns the DB class itself for function chaining.
     */
    static close(){
        var connections = this.__connections;
        for(var spec in connections){
            if(typeof connections[spec].destroy == 'function') //MySQL
                connections[spec].destroy();
            else if(typeof connections[spec].close == 'function') //SQLite
                connections[spec].close();
            delete connections[spec]; //Remove the connection quote.
        }
        return this;
    }
}

DB.config({}); //Initiate configuration.

module.exports = DB;