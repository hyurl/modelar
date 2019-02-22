import { EventEmitter } from "events";
import { MysqlAdapter } from "modelar-mysql-adapter";
// import { PostgresAdapter } from "modelar-postgres-adapter";
import { DBConfig } from "./interfaces";
import { Adapter } from "./Adapter";
import HideProtectedProperties = require("hide-protected-properties");
import assign = require("lodash/assign");

const IdentifierException = /[~`!@#\$%\^&\*\(\)\-\+=\{\}\[\]\|:"'<>,\?\/\s]/;

/**
 * *Database Manager.*
 * 
 * This class provides an internal pool for connections, when a connection has
 * done its job, it could be recycled and retrieved, there for saving the 
 * resources and speeding up the program.
 */
@HideProtectedProperties
export class DB extends EventEmitter {
    /** The last executed SQL command. */
    command: string = "";

    /** The last executed SQL statement. */
    sql: string = "";

    /** The binding data of the last executed SQL statement. */
    bindings: any[] = [];

    /** The ID returned by executing the last insert statement. */
    insertId: number = 0;

    /**
     * A number that represents how many records are affected by executing the 
     * last SQL statement.
     */
    affectedRows: number = 0;

    /** Data source name of the current instance. */
    dsn: string = "";

    /** Database configurations of the current instance. */
    config: DBConfig;

    /** The data fetched by executing a select statement. */
    data: any[] | { [field: string]: any };

    /** @private */
    private _events: { [event: string]: any };
    /** @private */
    private _eventsCount: number;
    /** @private */
    private _adapter: Adapter;

    /** @private */
    private static _events: { [event: string]: any } = {};
    static config = DBConfig;
    static adapters: { [type: string]: typeof Adapter | any } = {
        mysql: MysqlAdapter,
        maria: MysqlAdapter,
        // postgres: PostgresAdapter,
    };

    /** Creates a new DB instance with a specified database name. */
    constructor(database: string);
    /** Creates a new DB instance with specified configurations. */
    constructor(config?: DBConfig);
    constructor(config: string | DBConfig) {
        super();
        if (typeof config == "string")
            config = { database: config };

        let Class = <typeof DB>this.constructor;

        this.set(assign({}, Class.config, config));
        this.dsn = this.getDSN();
        this.data = [];
        this._events = assign({}, Class._events);
        this._eventsCount = Object.keys(this._events).length;
        this._eventsCount;
    }

    /** @protected */
    protected get adapter(): Adapter {
        let Class = <typeof DB>this.constructor;
        if (!this._adapter) {
            let Adapter = Class.adapters[this.config.type];
            this._adapter = new Adapter;
        }
        return this._adapter;
    }

    protected set adapter(v: Adapter) {
        this._adapter = v;
    }

    /** @private */
    getDSN(): string {
        if (this.config.connectionString)
            return this.config.connectionString;

        let config = this.config,
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

    /** Sets database configurations for the current instance. */
    set(config: DBConfig): this;
    set(name: string, value: any): this;
    set(...args) {
        let config,
            Class = <typeof DB>this.constructor;

        if (typeof args[0] === "string") {
            config = {};
            config[args[0]] = args[1];
        } else {
            config = args[0];
        }
        this.config = assign({}, Class.config, config);
        return this;
    }

    /**
     * Adds quotes to a specified value.
     * 
     * @param value A value that needs to be quoted.
     */
    quote(value: any): string | number | void {
        let quote = this.adapter.quote || "'",
            re = new RegExp(quote, "g");

        if (value instanceof DB.Identifier)
            return this.backquote(value);

        switch (typeof value) {
            case "string":
                value = value.replace(/\\/g, "\\\\").replace(re, "\\" + quote);
                value = quote + value + quote;
                break;
            case "object":
            case "symbol":
            case "function":
                value = quote + value.toString() + quote;
                break;
            case "undefined":
                value = null;
                break;
        }

        return value;
    }

    /**
     * Adds back-quotes to a specified identifier.
     * 
     * @param identifier An identifier (table name or field name) that needs 
     *  to be quoted.
     */
    backquote(identifier: string | DB.Identifier): string {
        identifier = identifier instanceof DB.Identifier
            ? identifier.name
            : identifier;

        if (typeof identifier != "string")
            return String(identifier);

        let sep = identifier.indexOf(",") > 0 ? "," : ".",
            parts = identifier.split(sep).map(part => part.trim()),
            quote: string[];

        if (this.adapter.backquote !== undefined) {
            if (this.adapter.backquote instanceof Array) {
                quote = this.adapter.backquote;
            } else {
                if (this.adapter.backquote.length === 2) {
                    quote = this.adapter.backquote.split("");
                } else {
                    quote = [
                        this.adapter.backquote,
                        this.adapter.backquote
                    ];
                }
            }
        } else {
            quote = ["`", "`"];
        }

        if (parts.length === 1 && !IdentifierException.test(identifier)) {
            identifier = quote[0] + identifier + quote[1];
        } else if (parts.length >= 2) {
            parts = parts.map(part => this.backquote(part));
            identifier = parts.join(sep == "," ? ", " : ".");
        }

        return identifier;
    }

    /** An alias of `db.backquote()`. */
    identifier(name: string): string {
        return this.backquote(name);
    }

    /** (**deprecated**) An alias of `db.emit()`. */
    trigger(event: string | symbol, ...args: any[]): boolean {
        return this.emit(event, ...args);
    }

    /** Acquires a connection to the database. */
    connect(): Promise<this> {
        return this.adapter.connect(this) as Promise<this>;
    }

    /** An alias of `db.connect()`. */
    acquire(): Promise<this> {
        return this.connect();
    }

    /**
     * Uses a DB instance and share its connection to the database.
     * 
     * @param db A DB instance that is already created.
     */
    use(db: DB): this {
        this.config = db.config;
        this.dsn = db.dsn;
        this.adapter = db.adapter;
        return this;
    }

    /** @private Opens connection if it's not opened. */
    private ensureConnect(): Promise<this> {
        if (!this.adapter.connection) {
            return this.connect();
        } else {
            return Promise.resolve(this);
        }
    }

    /**
     * Executes a SQL statement.
     * 
     * @param sql The SQL statement.
     * @param bindings The data bound to the SQL statement.
     */
    query(sql: string, bindings?: any[]): Promise<this>;
    query(sql: string, ...bindings: any[]): Promise<this>;
    /**
     * Executes a SQL statement written in an ES6 `tagged template` string.
     * @example db.query(s`select from article where ${i`id`} = ${1}`)
     */
    query(sql: DB.Statement): Promise<this>;
    query(sql: string | DB.Statement, ...bindings: any[]) {
        return this.ensureConnect().then(() => {
            if (sql instanceof DB.Statement) {
                let res = this.processStatement(sql);
                this.sql = res.sql.trim();
                this.bindings = [].concat(res.bindings);
            } else {
                if (bindings[0] instanceof Array)
                    bindings = bindings[0];

                this.sql = (<string>sql).trim();
                this.bindings = [].concat(bindings);
            }

            // remove the trailing ';' in the sql.
            if (this.sql[this.sql.length - 1] == ";")
                this.sql = this.sql.slice(0, -1);

            let i = this.sql.indexOf(" "),
                command = this.sql.substring(0, i).toLowerCase();

            this.command = command;
            this.emit("query", this);

            return this.adapter.query(this, this.sql, this.bindings);
        });
    }

    /**
     * Begins transaction.
     * 
     * @param cb If provided, the actions in this function will be automatically
     *  handled, that means if the program goes well, the transaction will be 
     *  automatically committed, otherwise it will be automatically rolled 
     *  back.
     */
    transaction(cb?: (db: this) => any): Promise<this> {
        return this.ensureConnect().then(() => {
            return this.adapter.transaction(this, cb);
        }) as Promise<this>;
    }

    /** Commits the transaction when things going well. */
    commit(): Promise<this> {
        return this.ensureConnect().then(() => {
            return this.adapter.commit(this) as Promise<this>;
        });
    }

    /** Rolls the transaction back when things going wrong. */
    rollback(): Promise<this> {
        return this.ensureConnect().then(() => {
            return this.adapter.rollback(this) as Promise<this>;
        });
    }

    /**
     * Releases the connection.
     * @alias DB.recycle()
     */
    release(): void {
        return this.adapter.release();
    }

    /** An alias of `db.release()`. */
    recycle(): void {
        return this.release();
    }

    /** Closes the connection. */
    close(): void {
        return this.adapter.close();
    }

    /** @protected */
    protected processStatement(callSite: DB.Statement): {
        sql: string;
        bindings: any[]
    } {
        let sql = "",
            bindings: any[] = [];

        callSite.pieces.forEach((piece, i) => {
            if (i > 0) {
                let j = i - 1;

                if (callSite.bindings[j] instanceof DB.Statement) {
                    // dealing with nested statement.
                    let res = this.processStatement(callSite.bindings[j]);
                    sql += res.sql;
                    bindings = bindings.concat(res.bindings);
                } else if (callSite.bindings[j] instanceof DB.Identifier) {
                    sql += this.backquote(callSite.bindings[j].name);
                } else {
                    sql += "?";
                    bindings.push(callSite.bindings[j]);
                }
            }

            sql += piece
        });

        return { sql, bindings };
    }

    /** Initiates database configurations for all instances. */
    static init<T extends DB>(config: DBConfig): new (...args) => T {
        this.config = assign({}, this.config, config);
        return <any>this;
    }

    /**
     * Binds a listener to an event for all instances.
     * 
     * @param event The event name.
     * @param listener A function called when the event fires.
     */
    static on<T extends DB>(
        event: string,
        listener: (...args: any[]) => void
    ): new (...args) => T {
        if (!this.hasOwnProperty("_events")) {
            this._events = assign({}, this._events);
        }

        if (this._events[event] instanceof Function) {
            this._events[event] = [this._events[event], listener];
        } else if (this._events[event] instanceof Array) {
            this._events[event].push(listener);
        } else {
            this._events[event] = listener;
        }

        return <any>this;
    }

    /**
     * Sets adapter for a specified database type.
     * 
     * @param type Database type.
     * @param AdapterClass The adapter class.
     */
    static setAdapter<T extends DB, K extends Adapter>(
        type: string,
        AdapterClass: new (...args) => K
    ): new (...args) => T {
        if (!this.hasOwnProperty("adapters")) {
            this.adapters = assign({}, this.adapters);
        }

        this.adapters[type] = AdapterClass;
        return <any>this;
    }

    /** Closes all connections in all pools. */
    static close(): void {
        for (let i in this.adapters) {
            let adapter: typeof Adapter = this.adapters[i];
            adapter.close();
        }
    }

    /** An alias of DB.close(). */
    static destroy(): void {
        return this.close();
    }
}

export interface DB {
    on(event: "query", listener: (thisObj: this) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export namespace DB {
    /**
     * Represents an statement object which contains both the information of SQL
     * statement and binding parameters.
     * The statement should be produced via tag `s` and a template string 
     * instead of instantiating this class.
     * @example
     *  var statement = s`select * from articles where id = ${1}`;
     */
    export class Statement {
        constructor(
            public readonly pieces: TemplateStringsArray,
            public readonly bindings: any[]
        ) { }
    }

    /**
     * Represents a database identifier object.
     * The identifier should be produced via tag `i` and a template string 
     * instead of instantiating this class.
     * @example
     *  var table = i`articles`;
     *  var field = i`id`;
     *  var statement = s`select * from ${table} where ${field} = ${1}`;
     */
    export class Identifier {
        constructor(public readonly name: string) { }
    }

    export type StatementTag = (
        callSite: TemplateStringsArray,
        ...bindings: any[]
    ) => Statement;

    export type IdentifierTag = (
        callSite: TemplateStringsArray,
        ...bindings: any[]
    ) => Identifier;
}

/**
 * Produces a DB.Statement instance via an ES6 `tagged template` string, the 
 * variables will be automatically bound as parameters or as fields.
 * @example
 *  var statement = s`select * from articles where id = ${1}`;
 */
export const s: DB.StatementTag = (
    callSite: TemplateStringsArray,
    ...bindings: any[]
) => {
    return new DB.Statement(callSite, bindings);
}

/**
 * Produces a DB.Identifier instance via an ES6 `tagged template` string.
 * @example
 *  var table = i`articles`;
 *  var field = i`id`;
 *  var statement = s`select * from ${table} where ${field} = ${1}`;
 */
export const i: DB.IdentifierTag = (
    callSite: TemplateStringsArray,
    ...bindings: any[]
) => {
    let name = callSite.map((str, i) => {
        return i > 0 ? bindings[i - 1] + str : str;
    }).join("");
    return new DB.Identifier(name);
}

// Compatible for version 2.x.
Object.defineProperties(DB.prototype, {
    _dsn: {
        get() {
            return this.dsn;
        },
        set(v) {
            this.dsn = v;
        }
    },

    _command: {
        get() {
            return this.command;
        },
        set(v) {
            this.command = v;
        }
    },

    _config: {
        get() {
            return this.config;
        },
        set(v) {
            this.config = v;
        }
    },

    _data: {
        get() {
            return this.data;
        },
        set(v) {
            this.data = v;
        }
    }
});