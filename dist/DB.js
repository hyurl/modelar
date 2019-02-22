"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var events_1 = require("events");
var modelar_mysql_adapter_1 = require("modelar-mysql-adapter");
var interfaces_1 = require("./interfaces");
var HideProtectedProperties = require("hide-protected-properties");
var assign = require("lodash/assign");
var IdentifierException = /[~`!@#\$%\^&\*\(\)\-\+=\{\}\[\]\|:"'<>,\?\/\s]/;
var DB = (function (_super) {
    tslib_1.__extends(DB, _super);
    function DB(config) {
        var _this = _super.call(this) || this;
        _this.command = "";
        _this.sql = "";
        _this.bindings = [];
        _this.insertId = 0;
        _this.affectedRows = 0;
        _this.dsn = "";
        if (typeof config == "string")
            config = { database: config };
        var Class = _this.constructor;
        _this.set(assign({}, Class.config, config));
        _this.dsn = _this.getDSN();
        _this.data = [];
        _this._events = assign({}, Class._events);
        _this._eventsCount = Object.keys(_this._events).length;
        _this._eventsCount;
        return _this;
    }
    DB_1 = DB;
    Object.defineProperty(DB.prototype, "adapter", {
        get: function () {
            var Class = this.constructor;
            if (!this._adapter) {
                var Adapter_1 = Class.adapters[this.config.type];
                this._adapter = new Adapter_1;
            }
            return this._adapter;
        },
        set: function (v) {
            this._adapter = v;
        },
        enumerable: true,
        configurable: true
    });
    DB.prototype.getDSN = function () {
        if (this.config.connectionString)
            return this.config.connectionString;
        var config = this.config, dsn = config.type + ":";
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
    };
    DB.prototype.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var config, Class = this.constructor;
        if (typeof args[0] === "string") {
            config = {};
            config[args[0]] = args[1];
        }
        else {
            config = args[0];
        }
        this.config = assign({}, Class.config, config);
        return this;
    };
    DB.prototype.quote = function (value) {
        var quote = this.adapter.quote || "'", re = new RegExp(quote, "g");
        if (value instanceof DB_1.Identifier)
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
    };
    DB.prototype.backquote = function (identifier) {
        var _this = this;
        identifier = identifier instanceof DB_1.Identifier
            ? identifier.name
            : identifier;
        if (typeof identifier != "string")
            return String(identifier);
        var sep = identifier.indexOf(",") > 0 ? "," : ".", parts = identifier.split(sep).map(function (part) { return part.trim(); }), quote;
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
        else if (parts.length >= 2) {
            parts = parts.map(function (part) { return _this.backquote(part); });
            identifier = parts.join(sep == "," ? ", " : ".");
        }
        return identifier;
    };
    DB.prototype.identifier = function (name) {
        return this.backquote(name);
    };
    DB.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this.emit.apply(this, [event].concat(args));
    };
    DB.prototype.connect = function () {
        return this.adapter.connect(this);
    };
    DB.prototype.acquire = function () {
        return this.connect();
    };
    DB.prototype.use = function (db) {
        this.config = db.config;
        this.dsn = db.dsn;
        this.adapter = db.adapter;
        return this;
    };
    DB.prototype.ensureConnect = function () {
        if (!this.adapter.connection) {
            return this.connect();
        }
        else {
            return Promise.resolve(this);
        }
    };
    DB.prototype.query = function (sql) {
        var _this = this;
        var bindings = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            bindings[_i - 1] = arguments[_i];
        }
        return this.ensureConnect().then(function () {
            if (sql instanceof DB_1.Statement) {
                var res = _this.processStatement(sql);
                _this.sql = res.sql.trim();
                _this.bindings = [].concat(res.bindings);
            }
            else {
                if (bindings[0] instanceof Array)
                    bindings = bindings[0];
                _this.sql = sql.trim();
                _this.bindings = [].concat(bindings);
            }
            if (_this.sql[_this.sql.length - 1] == ";")
                _this.sql = _this.sql.slice(0, -1);
            var i = _this.sql.indexOf(" "), command = _this.sql.substring(0, i).toLowerCase();
            _this.command = command;
            _this.emit("query", _this);
            return _this.adapter.query(_this, _this.sql, _this.bindings);
        });
    };
    DB.prototype.transaction = function (cb) {
        var _this = this;
        return this.ensureConnect().then(function () {
            return _this.adapter.transaction(_this, cb);
        });
    };
    DB.prototype.commit = function () {
        var _this = this;
        return this.ensureConnect().then(function () {
            return _this.adapter.commit(_this);
        });
    };
    DB.prototype.rollback = function () {
        var _this = this;
        return this.ensureConnect().then(function () {
            return _this.adapter.rollback(_this);
        });
    };
    DB.prototype.release = function () {
        return this.adapter.release();
    };
    DB.prototype.recycle = function () {
        return this.release();
    };
    DB.prototype.close = function () {
        return this.adapter.close();
    };
    DB.prototype.processStatement = function (callSite) {
        var _this = this;
        var sql = "", bindings = [];
        callSite.pieces.forEach(function (piece, i) {
            if (i > 0) {
                var j = i - 1;
                if (callSite.bindings[j] instanceof DB_1.Statement) {
                    var res = _this.processStatement(callSite.bindings[j]);
                    sql += res.sql;
                    bindings = bindings.concat(res.bindings);
                }
                else if (callSite.bindings[j] instanceof DB_1.Identifier) {
                    sql += _this.backquote(callSite.bindings[j].name);
                }
                else {
                    sql += "?";
                    bindings.push(callSite.bindings[j]);
                }
            }
            sql += piece;
        });
        return { sql: sql, bindings: bindings };
    };
    DB.init = function (config) {
        this.config = assign({}, this.config, config);
        return this;
    };
    DB.on = function (event, listener) {
        if (!this.hasOwnProperty("_events")) {
            this._events = assign({}, this._events);
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
    };
    DB.setAdapter = function (type, AdapterClass) {
        if (!this.hasOwnProperty("adapters")) {
            this.adapters = assign({}, this.adapters);
        }
        this.adapters[type] = AdapterClass;
        return this;
    };
    DB.close = function () {
        for (var i_1 in this.adapters) {
            var adapter = this.adapters[i_1];
            adapter.close();
        }
    };
    DB.destroy = function () {
        return this.close();
    };
    var DB_1;
    DB._events = {};
    DB.config = interfaces_1.DBConfig;
    DB.adapters = {
        mysql: modelar_mysql_adapter_1.MysqlAdapter,
        maria: modelar_mysql_adapter_1.MysqlAdapter,
    };
    DB = DB_1 = tslib_1.__decorate([
        HideProtectedProperties
    ], DB);
    return DB;
}(events_1.EventEmitter));
exports.DB = DB;
(function (DB) {
    var Statement = (function () {
        function Statement(pieces, bindings) {
            this.pieces = pieces;
            this.bindings = bindings;
        }
        return Statement;
    }());
    DB.Statement = Statement;
    var Identifier = (function () {
        function Identifier(name) {
            this.name = name;
        }
        return Identifier;
    }());
    DB.Identifier = Identifier;
})(DB = exports.DB || (exports.DB = {}));
exports.DB = DB;
exports.s = function (callSite) {
    var bindings = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        bindings[_i - 1] = arguments[_i];
    }
    return new DB.Statement(callSite, bindings);
};
exports.i = function (callSite) {
    var bindings = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        bindings[_i - 1] = arguments[_i];
    }
    var name = callSite.map(function (str, i) {
        return i > 0 ? bindings[i - 1] + str : str;
    }).join("");
    return new DB.Identifier(name);
};
Object.defineProperties(DB.prototype, {
    _dsn: {
        get: function () {
            return this.dsn;
        },
        set: function (v) {
            this.dsn = v;
        }
    },
    _command: {
        get: function () {
            return this.command;
        },
        set: function (v) {
            this.command = v;
        }
    },
    _config: {
        get: function () {
            return this.config;
        },
        set: function (v) {
            this.config = v;
        }
    },
    _data: {
        get: function () {
            return this.data;
        },
        set: function (v) {
            this.data = v;
        }
    }
});
//# sourceMappingURL=DB.js.map