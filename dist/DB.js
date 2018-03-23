"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = require("events");
const modelar_mysql_adapter_1 = require("modelar-mysql-adapter");
const modelar_postgres_adapter_1 = require("modelar-postgres-adapter");
const interfaces_1 = require("./interfaces");
const HideProtectedProperties = require("hide-protected-properties");
const IdentifierException = /[~`!@#\$%\^&\*\(\)\-\+=\{\}\[\]\|:"'<>,\?\/\s]/;
let DB = DB_1 = class DB extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.sql = "";
        this.bindings = [];
        this.insertId = 0;
        this.affectedRows = 0;
        this.dsn = "";
        this.command = "";
        this.data = [];
        if (typeof config == "string")
            config = { database: config };
        let Class = this.constructor;
        this.set(Object.assign({}, Class.config, config));
        this.dsn = this._getDSN();
        this._events = Object.assign({}, Class._events);
        this._eventsCount = Object.keys(this._events).length;
    }
    get adapter() {
        let Class = this.constructor;
        if (!this._adapter) {
            let Adapter = Class.adapters[this.config.type];
            this._adapter = new Adapter;
        }
        return this._adapter;
    }
    set adapter(v) {
        this._adapter = v;
    }
    _getDSN() {
        let config = this.config, dsn = config.type + ":";
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
    set(...args) {
        let config, Class = this.constructor;
        if (typeof args[0] === "string") {
            config = {};
            config[args[0]] = args[1];
        }
        else {
            config = args[0];
        }
        this.config = Object.assign({}, Class.config, config);
        return this;
    }
    quote(value) {
        let quote = this.adapter.quote || "'", re = new RegExp(quote, "g");
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
    backquote(identifier) {
        if (typeof identifier !== "string")
            return identifier;
        let parts = identifier.split("."), quote;
        if (this.adapter.backquote !== undefined) {
            if (this.adapter.backquote instanceof Array) {
                quote = this.adapter.backquote;
            }
            else {
                if (this.adapter.backquote.length === 2) {
                    quote = this.adapter.backquote.split("");
                }
                else {
                    quote = [
                        this.adapter.backquote,
                        this.adapter.backquote
                    ];
                }
            }
        }
        else {
            quote = ["`", "`"];
        }
        if (parts.length === 1 && !IdentifierException.test(identifier)) {
            identifier = quote[0] + identifier + quote[1];
        }
        else if (parts.length === 2) {
            identifier = this.backquote(parts[0]) + "." +
                this.backquote(parts[1]);
        }
        return identifier;
    }
    trigger(event, ...args) {
        return this.emit(event, ...args);
    }
    connect() {
        return this.adapter.connect(this);
    }
    acquire() {
        return this.connect();
    }
    use(db) {
        this.config = db.config;
        this.dsn = db.dsn;
        this.adapter = db.adapter;
        return this;
    }
    query(sql, ...bindings) {
        if (this.adapter.connection === null) {
            return this.connect().then(() => {
                return this.query(sql, ...bindings);
            });
        }
        if (bindings[0] instanceof Array)
            bindings = bindings[0];
        this.sql = sql.trim();
        this.bindings = Object.assign([], bindings);
        let i = this.sql.indexOf(" "), command = this.sql.substring(0, i).toLowerCase();
        this.command = command;
        this.emit("query", this);
        return this.adapter.query(this, sql, bindings);
    }
    transaction(cb) {
        return this.adapter.transaction(this, cb);
    }
    commit() {
        return this.adapter.commit(this);
    }
    rollback() {
        return this.adapter.rollback(this);
    }
    release() {
        return this.adapter.release();
    }
    recycle() {
        return this.release();
    }
    close() {
        return this.adapter.close();
    }
    static init(config) {
        this.config = Object.assign({}, this.config, config);
        return this;
    }
    static on(event, listener) {
        if (!this.hasOwnProperty("_events")) {
            this._events = Object.assign({}, this._events);
        }
        if (this._events[event] instanceof Function) {
            this._events[event] = [this._events[event], listener];
        }
        else if (this._events[event] instanceof Array) {
            this._events[event].push(listener);
        }
        else {
            this._events[event] = listener;
        }
        return this;
    }
    static setAdapter(type, AdapterClass) {
        if (!this.hasOwnProperty("adapters")) {
            this.adapters = Object.assign({}, this.adapters);
        }
        this.adapters[type] = AdapterClass;
        return this;
    }
    static close() {
        for (let i in this.adapters) {
            let adapter = this.adapters[i];
            adapter.close();
        }
    }
    static destroy() {
        return this.close();
    }
};
DB._events = {};
DB.config = interfaces_1.DBConfig;
DB.adapters = {
    mysql: modelar_mysql_adapter_1.MysqlAdapter,
    maria: modelar_mysql_adapter_1.MysqlAdapter,
    postgres: modelar_postgres_adapter_1.PostgresAdapter,
};
DB = DB_1 = tslib_1.__decorate([
    HideProtectedProperties
], DB);
exports.DB = DB;
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
var DB_1;
//# sourceMappingURL=DB.js.map