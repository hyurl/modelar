"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DB_1 = require("./DB");
var Errors_1 = require("./Errors");
var fill = require("lodash/fill");
var Query = (function (_super) {
    tslib_1.__extends(Query, _super);
    function Query(table) {
        if (table === void 0) { table = ""; }
        var _this = _super.call(this) || this;
        _this._selects = "*";
        _this._distinct = "";
        _this._join = "";
        _this._where = "";
        _this._orderBy = "";
        _this._groupBy = "";
        _this._having = "";
        _this._limit = "";
        _this._union = "";
        _this._bindings = [];
        _this.from(table);
        return _this;
    }
    Query.prototype.field = function (name) {
        return new Query.Field(name);
    };
    Query.prototype.select = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var fields = args[0] instanceof Array ? args[0] : args;
        fields = fields.map(function (field) { return _this.backquote(field); });
        this._selects = fields.join(", ");
        return this;
    };
    Query.prototype.from = function () {
        var tables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tables[_i] = arguments[_i];
        }
        if (tables.length > 1) {
            this.table = tables.join(", ");
        }
        else if (tables[0] instanceof Array) {
            this.table = tables[0].join(", ");
        }
        else {
            this.table = tables[0];
        }
        return this;
    };
    Query.prototype.join = function (table) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._handleJoin.apply(this, [table, "inner"].concat(args));
    };
    Query.prototype.leftJoin = function (table) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._handleJoin.apply(this, [table, "left"].concat(args));
    };
    Query.prototype.rightJoin = function (table) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._handleJoin.apply(this, [table, "right"].concat(args));
    };
    Query.prototype.fullJoin = function (table) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._handleJoin.apply(this, [table, "full"].concat(args));
    };
    Query.prototype.crossJoin = function (table) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._handleJoin.apply(this, [table, "cross"].concat(args));
    };
    Query.prototype._handleJoin = function (table, type) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (!this._join) {
            this._join = this.backquote(this.table);
        }
        else {
            this._join = "(" + this._join + ")";
        }
        this._join += " " + type + " join " + this.backquote(table) + " on ";
        if (args.length == 1) {
            if (typeof args[0] == "object") {
                var joins = [];
                for (var field in args[0]) {
                    var value = args[0][field], statement = this.backquote(field) + " = ";
                    if (value instanceof Query.Field) {
                        statement += this.backquote(value.name);
                    }
                    else {
                        statement += "?";
                        this._bindings.push(value);
                    }
                    joins.push(statement);
                }
                this._join += joins.join(" and ");
            }
            else if (typeof args[0] == "function") {
                var cb = args[0], query = new Query().use(this);
                cb.call(query, query);
                if (query._where) {
                    this._join += query._where;
                    this._bindings = this._bindings.concat(query._bindings);
                }
            }
        }
        else if (args.length == 2) {
            this._join += this.backquote(args[0]) + " = " + this.backquote(args[1]);
        }
        else if (args.length == 3) {
            this._join += this.backquote(args[0])
                + " " + this.backquote(args[1]) + " "
                + this.backquote(args[2]);
        }
        return this;
    };
    Query.prototype.where = function (field, operator, value) {
        if (operator === void 0) { operator = null; }
        if (value === void 0) { value = undefined; }
        if (typeof field === "object") {
            for (var key in field) {
                this.where(key, "=", field[key]);
            }
        }
        else {
            if (this._where)
                this._where += " and ";
            if (field instanceof Function) {
                this._handleNestedWhere(field);
            }
            else if (operator instanceof Function) {
                this._handleWhereChild(field, operator);
            }
            else if (value instanceof Function) {
                this._handleWhereChild(field, value, operator);
            }
            else {
                this._handleWhere(field, operator, value);
            }
        }
        return this;
    };
    Query.prototype.orWhere = function (field, operator, value) {
        if (operator === void 0) { operator = null; }
        if (value === void 0) { value = undefined; }
        if (typeof field === "object") {
            for (var key in field) {
                this.orWhere(key, "=", field[key]);
            }
        }
        else {
            if (this._where)
                this._where += " or ";
            if (field instanceof Function) {
                this._handleNestedWhere(field);
            }
            else if (operator instanceof Function) {
                this._handleWhereChild(field, operator);
            }
            else if (value instanceof Function) {
                this._handleWhereChild(field, value, operator);
            }
            else {
                this._handleWhere(field, operator, value);
            }
        }
        return this;
    };
    Query.prototype._handleWhere = function (field, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        this._where += this.backquote(field) + " " + operator;
        if (value instanceof Query.Field) {
            this._where += " " + this.backquote(value.name);
        }
        else {
            this._where += " ?";
            this._bindings.push(value);
        }
        return this;
    };
    Query.prototype._handleNestedWhere = function (cb) {
        var query = new Query().use(this);
        cb.call(query, query);
        if (query._where) {
            this._where += "(" + query._where + ")";
            this._bindings = this._bindings.concat(query._bindings);
        }
        return this;
    };
    Query.prototype._handleWhereChild = function (field, cb, operator) {
        if (operator === void 0) { operator = "="; }
        var query = this._getQueryBy(cb);
        this._where += this.backquote(field) + (" " + operator + " (" + query.sql + ")");
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    };
    Query.prototype._getQueryBy = function (cb) {
        var query = new Query().use(this);
        cb.call(query, query);
        query.sql = query.getSelectSQL();
        return query;
    };
    Query.prototype.whereBetween = function (field, _a) {
        var min = _a[0], max = _a[1];
        return this._handleBetween(field, [min, max]);
    };
    Query.prototype.whereNotBetween = function (field, _a) {
        var min = _a[0], max = _a[1];
        return this._handleBetween(field, [min, max], false);
    };
    Query.prototype.orWhereBetween = function (field, _a) {
        var min = _a[0], max = _a[1];
        return this._handleBetween(field, [min, max], true, "or");
    };
    Query.prototype.orWhereNotBetween = function (field, _a) {
        var min = _a[0], max = _a[1];
        return this._handleBetween(field, [min, max], false, "or");
    };
    Query.prototype._handleBetween = function (field, _a, between, conj) {
        var min = _a[0], max = _a[1];
        if (between === void 0) { between = true; }
        if (conj === void 0) { conj = "and"; }
        if (this._where)
            this._where += " " + conj + " ";
        this._where += this.backquote(field) + (between ? "" : " not") +
            " between ? and ?";
        this._bindings = this._bindings.concat([min, max]);
        return this;
    };
    Query.prototype.whereIn = function (field, values) {
        return this._handleIn(field, values);
    };
    Query.prototype.whereNotIn = function (field, values) {
        return this._handleIn(field, values, false);
    };
    Query.prototype.orWhereIn = function (field, values) {
        return this._handleIn(field, values, true, "or");
    };
    Query.prototype.orWhereNotIn = function (field, values) {
        return this._handleIn(field, values, false, "or");
    };
    Query.prototype._handleIn = function (field, values, isIn, conj) {
        if (isIn === void 0) { isIn = true; }
        if (conj === void 0) { conj = "and"; }
        if (this._where)
            this._where += " " + conj + " ";
        if (values instanceof Function) {
            return this._handleInChild(field, values, isIn);
        }
        else {
            var _values = fill(Array(values.length), "?");
            this._where += this.backquote(field) + (isIn ? "" : " not") +
                " in (" + _values.join(", ") + ")";
            this._bindings = this._bindings.concat(values);
            return this;
        }
    };
    Query.prototype._handleInChild = function (field, cb, isIn) {
        if (isIn === void 0) { isIn = true; }
        var query = this._getQueryBy(cb);
        this._where += this.backquote(field) + (isIn ? "" : " not") +
            " in (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    };
    Query.prototype.whereNull = function (field) {
        return this._handleWhereNull(field);
    };
    Query.prototype.whereNotNull = function (field) {
        return this._handleWhereNull(field, false);
    };
    Query.prototype.orWhereNull = function (field) {
        return this._handleWhereNull(field, true, "or");
    };
    Query.prototype.orWhereNotNull = function (field) {
        return this._handleWhereNull(field, false, "or");
    };
    Query.prototype._handleWhereNull = function (field, isNull, conj) {
        if (isNull === void 0) { isNull = true; }
        if (conj === void 0) { conj = "and"; }
        if (this._where)
            this._where += " " + conj + " ";
        this._where += this.backquote(field) + " is " +
            (isNull ? "" : "not ") + "null";
        return this;
    };
    Query.prototype.whereExists = function (nested) {
        return this._handleExists(nested);
    };
    Query.prototype.whereNotExists = function (nested) {
        return this._handleExists(nested, false);
    };
    Query.prototype.orWhereExists = function (nested) {
        return this._handleExists(nested, true, "or");
    };
    Query.prototype.orWhereNotExists = function (nested) {
        return this._handleExists(nested, false, "or");
    };
    Query.prototype._handleExists = function (nested, exists, conj) {
        if (exists === void 0) { exists = true; }
        if (conj === void 0) { conj = "and"; }
        if (this._where)
            this._where += " " + conj + " ";
        var query = this._getQueryBy(nested);
        this._where += (exists ? "" : "not ") + "exists (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    };
    Query.prototype.orderBy = function (field, sequence) {
        var comma = this._orderBy ? ", " : "";
        this._orderBy += comma + this.backquote(field);
        if (sequence)
            this._orderBy += " " + sequence;
        return this;
    };
    Query.prototype.random = function () {
        return this.adapter.random(this);
    };
    Query.prototype.groupBy = function () {
        var _this = this;
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(function (field) { return _this.backquote(field); });
        this._groupBy = fields.join(", ");
        return this;
    };
    Query.prototype.having = function (raw) {
        this._having += (this._having ? " and " : "") + raw;
        return this;
    };
    Query.prototype.limit = function (length, offset) {
        return this.adapter.limit(this, length, offset);
    };
    Query.prototype.distinct = function () {
        this._distinct = "distinct";
        return this;
    };
    Query.prototype.union = function (query, all) {
        if (all === void 0) { all = false; }
        if (this._union)
            this._union += " union ";
        if (query instanceof Query) {
            query.sql = query.getSelectSQL();
            this._union += (all ? "all " : "") + query.sql;
            this._bindings = this._bindings.concat(query._bindings);
        }
        else {
            this._union += (all ? "all " : "") + query;
        }
        return this;
    };
    Query.prototype.insert = function (data) {
        var _this = this;
        var bindings = [], fields = [], values = [], isObj = !(data instanceof Array);
        if (!Object.keys(data).length) {
            throw new Errors_1.InsertionError("No valid data were given for inserting.");
        }
        for (var field in data) {
            values.push("?");
            bindings.push(data[field]);
            if (isObj)
                fields.push(this.backquote(field));
        }
        if (isObj)
            fields = fields.join(", ");
        values = values.join(", ");
        this.sql = "insert into " + this.backquote(this.table)
            + " " + (isObj ? "(" + fields + ") " : "") + ("values (" + values + ")");
        this.emit("insert", this);
        return this.query(this.sql, bindings).then(function () {
            _this.bindings = [].concat(bindings);
            _this.emit("inserted", _this);
            return _this;
        });
    };
    Query.prototype.update = function (data) {
        var parts = [], bindings = [];
        for (var field in data) {
            parts.push(this.backquote(field) + " = ?");
            bindings.push(data[field]);
        }
        return this._handleUpdate(parts, bindings);
    };
    Query.prototype.increase = function (field, step) {
        if (step === void 0) { step = 1; }
        return this._handleCrease(field, step, "+");
    };
    Query.prototype.decrease = function (field, step) {
        if (step === void 0) { step = 1; }
        return this._handleCrease(field, step, "-");
    };
    Query.prototype._handleCrease = function (field, step, type) {
        var data, parts = [], bindings = [];
        if (typeof field == "object") {
            data = field;
        }
        else {
            data = {};
            data[field] = step;
        }
        for (var field_1 in data) {
            if (data[field_1] > 0) {
                bindings.push(data[field_1]);
                field_1 = this.backquote(field_1);
                parts.push(field_1 + " = " + field_1 + " " + type + " ?");
            }
        }
        return this._handleUpdate(parts, bindings);
    };
    Query.prototype._handleUpdate = function (parts, bindings) {
        var _this = this;
        if (Object.keys(parts).length === 0) {
            throw new Errors_1.UpdateError("No valid data were given for updating.");
        }
        bindings = bindings.concat(this._bindings);
        this.sql = "update " + this.backquote(this.table) + " set "
            + parts.join(", ") + (this._where ? " where " + this._where : "");
        this.emit("update", this);
        return this.query(this.sql, bindings).then(function () {
            _this.bindings = [].concat(bindings);
            _this.emit("updated", _this);
            return _this;
        });
    };
    Query.prototype.delete = function () {
        var _this = this;
        this.sql = "delete from " + this.backquote(this.table) +
            (this._where ? " where " + this._where : "");
        this.emit("delete", this);
        return this.query(this.sql, this._bindings).then(function () {
            _this.bindings = [].concat(_this._bindings);
            _this.emit("deleted", _this);
            return _this;
        });
    };
    Query.prototype.get = function () {
        var promise = this.limit(1)._handleSelect().then(function (data) { return data[0]; });
        if (!this["_isModel"])
            this.emit("get", this);
        return promise;
    };
    Query.prototype.all = function () {
        var promise = this._handleSelect();
        if (!this["_isModel"])
            this.emit("get", this);
        return promise.then(function (data) {
            return data instanceof Array ? data : [data];
        });
    };
    Query.prototype.count = function (field) {
        if (field === void 0) { field = "*"; }
        if (field != "*" && this._distinct)
            field = "distinct " + this.backquote(field);
        return this._handleAggregate("count", field);
    };
    Query.prototype.max = function (field) {
        return this._handleAggregate("max", field);
    };
    Query.prototype.min = function (field) {
        return this._handleAggregate("min", field);
    };
    Query.prototype.avg = function (field) {
        return this._handleAggregate("avg", field);
    };
    Query.prototype.sum = function (field) {
        return this._handleAggregate("sum", field);
    };
    Query.prototype.chunk = function (length, cb) {
        var _this = this;
        var offset = 0, query = new Query(this.table).use(this);
        query._where = this._where;
        query._join = this._join;
        query._bindings = this._bindings;
        return query.count().then(function (total) {
            var loop = function () {
                return _this.limit(length, offset).all().then(function (data) {
                    var ok = cb.call(_this, data);
                    offset += length;
                    if (data.length == length && ok !== false && offset < total) {
                        return loop();
                    }
                    else {
                        return data;
                    }
                });
            };
            return loop();
        });
    };
    Query.prototype.paginate = function (page, length) {
        var _this = this;
        if (!length)
            length = parseInt(String(this._limit)) || 10;
        var offset = (page - 1) * length, query = new Query(this.table).use(this);
        query._where = this._where;
        query._join = this._join;
        query._bindings = this._bindings;
        return query.count().then(function (total) {
            if (!total) {
                return {
                    page: page,
                    pages: 0,
                    limit: length,
                    total: total,
                    data: [],
                };
            }
            else {
                return _this.limit(length, offset).all().then(function (data) {
                    return {
                        page: page,
                        pages: Math.ceil(total / length),
                        limit: length,
                        total: total,
                        data: data,
                    };
                });
            }
        });
    };
    Query.prototype._handleAggregate = function (name, field) {
        this._selects = name + "(" + this.backquote(field) + ") as " +
            this.backquote("num");
        return this._handleSelect().then(function (data) {
            return parseFloat(data[0].num);
        });
    };
    Query.prototype._handleSelect = function () {
        var _this = this;
        this.sql = this.getSelectSQL();
        return this.query(this.sql, this._bindings).then(function (query) {
            _this.bindings = [].concat(_this._bindings);
            return query.data;
        });
    };
    Query.prototype.getSelectSQL = function () {
        return this.adapter.getSelectSQL(this);
    };
    return Query;
}(DB_1.DB));
exports.Query = Query;
(function (Query) {
    var Field = (function () {
        function Field(name) {
            this.name = name;
        }
        return Field;
    }());
    Query.Field = Field;
})(Query = exports.Query || (exports.Query = {}));
exports.Query = Query;
//# sourceMappingURL=Query.js.map