/// <reference types="node" />
import { EventEmitter } from "events";
import { DBConfig } from "./interfaces";
import { Adapter } from "./Adapter";
/**
 * *Database Manager.*
 *
 * This class provides an internal pool for connections, when a connection has
 * done its job, it could be recycled and retrieved, there for saving the
 * resources and speeding up the program.
 */
export declare class DB extends EventEmitter {
    /** The SQL statement. */
    sql: string;
    /** The binding data. */
    bindings: any[];
    /** The ID returned by executing the last insert statement. */
    insertId: number;
    /**
     * A count that represents how many records are affected by executing the
     * last SQL statement.
     */
    affectedRows: number;
    /** The last executed SQL command. */
    _command: string;
    /** The data fetched by executing a select statement. */
    _data: any[] | {
        [field: string]: any;
    };
    /** Data source name of the current instance. */
    _dsn: string;
    /** Database configurations of the current instance. */
    _config: DBConfig;
    private _events: object;
    private _eventsCount: number;
    protected _adapter: Adapter;
    static _events: object;
    static _config: DBConfig;
    static _adapters: {
        [type: string]: Adapter | any;
    };
    /** Creates a new DB instance with a specified database name. */
    constructor(database: string);
    /** Creates a new DB instance with specified configurations. */
    constructor(config?: DBConfig);
    private _getDSN(): string;
    /**
     * Adds quotes to a specified value.
     *
     * @param value A value that needs to be quoted.
     */
    quote(value: string): string;
    /**
     * Adds back-quotes to a specified identifier.
     *
     * @param identifier An identifier (table name or field name) that needs
     *  to be quoted.
     */
    backquote(identifier: string): string;
    /** An alias of `db.emit()`. */
    trigger(event: string | symbol, ...args: any[]): boolean;
    /** Acquires a connection to the database. */
    connect(): Promise<this>;
    /** An alias of `db.connect()`. */
    acquire(): Promise<this>;
    /**
     * Uses a DB instance and share its connection to the database.
     *
     * @param db A DB instance that is already created.
     */
    use(db: DB): this;
    /**
     * Executes a SQL statement.
     *
     * @param sql The SQL statement.
     * @param bindings The data bound to the SQL statement.
     */
    query(sql: string, bindings?: any[]): Promise<this>;
    /**
     * Executes a SQL statement.
     * @param sql The SQL statement.
     * @param bindings The data bound to the SQL statement.
     */
    query(sql: string, ...bindings: any[]): Promise<this>;
    /** Begins transaction. */
    transaction(): Promise<this>;
    /**
     * Begins transaction and handle actions in a callback function.
     *
     * @param cb The actions in this function will be automatically handled,
     *  that means if the program goes well, the transaction will be
     *  automatically committed, otherwise it will be automatically rolled
     *  back.
     */
    transaction(cb: (db: this) => void): Promise<this>;
    /** Commits the transaction when things going well. */
    commit(): Promise<this>;
    /** Rolls the transaction back when things going wrong. */
    rollback(): Promise<this>;
    /** Releases the connection. */
    release(): void;
    /** An alias of `db.release()`. */
    recycle(): void;
    /** Closes the connection. */
    close(): void;
    /** Initiates the DB class for every instances. */
    static init(config: DBConfig): typeof DB;
    /**
     * Binds a listener to an event for all DB instances.
     *
     * @param event The event name.
     * @param listener A function called when the event fires.
     */
    static on(event: string | symbol, listener: (...args: any[]) => void): typeof DB;
    /**
     * Sets adapter for a specified database type.
     *
     * @param type Database type.
     * @param adateper The adapter instance.
     */
    static setAdapter(type: string, adapter: typeof Adapter): typeof DB;
    /** Closes all connections in all pools. */
    static close(): void;
    /** An alias of DB.close(). */
    static destroy(): void;
}
