"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DB_1 = require("./DB");
const Errors_1 = require("./Errors");
class Query extends DB_1.DB {
    constructor(table = "") {
        super();
        this._inserts = "";
        this._updates = "";
        this._selects = "*";
        this._distinct = "";
        this._join = "";
        this._where = "";
        this._orderBy = "";
        this._groupBy = "";
        this._having = "";
        this._limit = "";
        this._union = "";
        this._bindings = [];
        this._isModel = false;
        this.table = table;
    }
    select(...args) {
        let fields = args[0] instanceof Array ? args[0] : args;
        fields = fields.map(field => this.backquote(field));
        this._selects = fields.join(", ");
        return this;
    }
    from(table) {
        this.table = table;
        return this;
    }
    join(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2);
    }
    leftJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "left");
    }
    rightJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "right");
    }
    fullJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "full");
    }
    crossJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "cross");
    }
    _handleJoin(table, field1, operator, field2, type = "inner") {
        if (!field2) {
            field2 = operator;
            operator = "=";
        }
        if (!this._join) {
            this._join = this.backquote(this.table);
        }
        else {
            this._join = "(" + this._join + ")";
        }
        this._join += " " + type + " join " + this.backquote(table) +
            " on " + this.backquote(field1) + " " + operator + " " +
            this.backquote(field2);
        return this;
    }
    where(field, operator = null, value = undefined) {
        if (typeof field === "object") {
            for (let key in field) {
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
    }
    orWhere(field, operator = null, value = undefined) {
        if (typeof field === "object") {
            for (let key in field) {
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
    }
    _handleWhere(field, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        this._where += this.backquote(field) + " " + operator + " ?";
        this._bindings.push(value);
        return this;
    }
    _handleNestedWhere(cb) {
        let query = new Query().use(this);
        cb.call(query, query);
        if (query._where) {
            this._where += "(" + query._where + ")";
            this._bindings = this._bindings.concat(query._bindings);
        }
        return this;
    }
    _handleWhereChild(field, cb, operator = "=") {
        let query = this._getQueryBy(cb);
        this._where += this.backquote(field) + ` ${operator} (${query.sql})`;
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }
    _getQueryBy(cb) {
        let query = new Query().use(this);
        cb.call(query, query);
        query.sql = query.getSelectSQL();
        return query;
    }
    whereBetween(field, [min, max]) {
        return this._handleBetween(field, [min, max]);
    }
    whereNotBetween(field, [min, max]) {
        return this._handleBetween(field, [min, max], false);
    }
    orWhereBetween(field, [min, max]) {
        return this._handleBetween(field, [min, max], true, "or");
    }
    orWhereNotBetween(field, [min, max]) {
        return this._handleBetween(field, [min, max], false, "or");
    }
    _handleBetween(field, [min, max], between = true, conj = "and") {
        if (this._where)
            this._where += ` ${conj} `;
        this._where += this.backquote(field) + (between ? "" : " not") +
            " between ? and ?";
        this._bindings = this._bindings.concat([min, max]);
        return this;
    }
    whereIn(field, values) {
        return this._handleIn(field, values);
    }
    whereNotIn(field, values) {
        return this._handleIn(field, values, false);
    }
    orWhereIn(field, values) {
        return this._handleIn(field, values, true, "or");
    }
    orWhereNotIn(field, values) {
        return this._handleIn(field, values, false, "or");
    }
    _handleIn(field, values, isIn = true, conj = "and") {
        if (this._where)
            this._where += ` ${conj} `;
        if (values instanceof Function) {
            return this._handleInChild(field, values, isIn);
        }
        else {
            let _values = Array(values.length).fill("?");
            this._where += this.backquote(field) + (isIn ? "" : " not") +
                " in (" + _values.join(", ") + ")";
            this._bindings = this._bindings.concat(values);
            return this;
        }
    }
    _handleInChild(field, cb, isIn = true) {
        let query = this._getQueryBy(cb);
        this._where += this.backquote(field) + (isIn ? "" : " not") +
            " in (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }
    whereNull(field) {
        return this._handleWhereNull(field);
    }
    whereNotNull(field) {
        return this._handleWhereNull(field, false);
    }
    orWhereNull(field) {
        return this._handleWhereNull(field, true, "or");
    }
    orWhereNotNull(field) {
        return this._handleWhereNull(field, false, "or");
    }
    _handleWhereNull(field, isNull = true, conj = "and") {
        if (this._where)
            this._where += ` ${conj} `;
        this._where += this.backquote(field) + " is " +
            (isNull ? "" : "not ") + "null";
        return this;
    }
    whereExists(nested) {
        return this._handleExists(nested);
    }
    whereNotExists(nested) {
        return this._handleExists(nested, false);
    }
    orWhereExists(nested) {
        return this._handleExists(nested, true, "or");
    }
    orWhereNotExists(nested) {
        return this._handleExists(nested, false, "or");
    }
    _handleExists(nested, exists = true, conj = "and") {
        if (this._where)
            this._where += ` ${conj} `;
        let query = this._getQueryBy(nested);
        this._where += (exists ? "" : "not ") + "exists (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }
    orderBy(field, sequence) {
        let comma = this._orderBy ? ", " : "";
        this._orderBy += comma + this.backquote(field);
        if (sequence)
            this._orderBy += " " + sequence;
        return this;
    }
    random() {
        return this.adapter.random(this);
    }
    groupBy(...fields) {
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => this.backquote(field));
        this._groupBy = fields.join(", ");
        return this;
    }
    having(raw) {
        this._having += (this._having ? " and " : "") + raw;
        return this;
    }
    limit(length, offset) {
        return this.adapter.limit(this, length, offset);
    }
    distinct() {
        this._distinct = "distinct";
        return this;
    }
    union(query, all = false) {
        if (query instanceof Query) {
            query.sql = query.getSelectSQL();
            this._union += " union " + (all ? "all " : "") + query.sql;
        }
        else if (typeof query == "string") {
            this._union += " union " + (all ? "all " : "") + query;
        }
        return this;
    }
    insert(data) {
        let bindings = [], fields = [], values = [], isObj = !Array.isArray(data);
        if (!Object.keys(data).length) {
            throw new Errors_1.InsertionError("No valid data were given for inserting.");
        }
        for (let field in data) {
            bindings.push(data[field]);
            if (isObj)
                fields.push(this.backquote(field));
            values.push("?");
        }
        if (isObj)
            fields = fields.join(", ");
        values = values.join(", ");
        this._inserts = (isObj ? `(${fields}) ` : "") + `values (${values})`;
        this.sql = "insert into " + this.backquote(this.table) + " " +
            this._inserts;
        this.emit("insert", this);
        return this.query(this.sql, bindings).then(() => {
            this.bindings = Object.assign([], bindings);
            this.emit("inserted", this);
            return this;
        });
    }
    update(data) {
        let parts = [], bindings = [];
        for (let field in data) {
            parts.push(this.backquote(field) + " = ?");
            bindings.push(data[field]);
        }
        return this._handleUpdate(parts, bindings);
    }
    increase(field, step = 1) {
        return this._handleCrease(field, step, "+");
    }
    decrease(field, step = 1) {
        return this._handleCrease(field, step, "-");
    }
    _handleCrease(field, step, type) {
        let data, parts = [], bindings = [];
        if (typeof field == "object") {
            data = field;
        }
        else {
            data = {};
            data[field] = step;
        }
        for (let field in data) {
            if (data[field] > 0) {
                bindings.push(data[field]);
                field = this.backquote(field);
                parts.push(`${field} = ${field} ${type} ?`);
            }
        }
        return this._handleUpdate(parts, bindings);
    }
    _handleUpdate(parts, bindings) {
        if (Object.keys(parts).length === 0) {
            throw new Errors_1.UpdateError("No valid data were given for updating.");
        }
        bindings = bindings.concat(this._bindings);
        this._updates = parts.join(", ");
        this.sql = `update ${this.backquote(this.table)} set ` +
            this._updates + (this._where ? " where " + this._where : "");
        this.emit("update", this);
        return this.query(this.sql, bindings).then(() => {
            this.bindings = Object.assign([], bindings);
            this.emit("updated", this);
            return this;
        });
    }
    delete() {
        this.sql = "delete from " + this.backquote(this.table) +
            (this._where ? " where " + this._where : "");
        this.emit("delete", this);
        return this.query(this.sql, this._bindings).then(() => {
            this.bindings = Object.assign([], this._bindings);
            this.emit("deleted", this);
            return this;
        });
    }
    get() {
        let promise = this.limit(1)._handleSelect().then(data => data[0]);
        if (!this._isModel)
            this.emit("get", this);
        return promise;
    }
    all() {
        let promise = this._handleSelect();
        if (!this._isModel)
            this.emit("get", this);
        return promise.then(data => {
            return data instanceof Array ? data : [data];
        });
    }
    count(field = "*") {
        if (field != "*" && this._distinct)
            field = "distinct " + this.backquote(field);
        return this._handleAggregate("count", field);
    }
    max(field) {
        return this._handleAggregate("max", field);
    }
    min(field) {
        return this._handleAggregate("min", field);
    }
    avg(field) {
        return this._handleAggregate("avg", field);
    }
    sum(field) {
        return this._handleAggregate("sum", field);
    }
    chunk(length, cb) {
        let offset = 0, loop = () => {
            return this.limit(length, offset).all().then(data => {
                let ok = cb.call(this, data);
                if (data.length === length && ok !== false) {
                    offset += length;
                    return loop();
                }
                else {
                    return data;
                }
            });
        };
        return loop();
    }
    paginate(page, length) {
        if (!length)
            length = parseInt(this._limit) || 10;
        let offset = (page - 1) * length, query = new Query(this.table).use(this);
        query._where = this._where;
        query._join = this._join;
        return query.count().then(total => {
            if (!total) {
                return {
                    page,
                    pages: 0,
                    limit: length,
                    total,
                    data: [],
                };
            }
            else {
                return this.limit(length, offset).all().then(data => {
                    if (data.length && data[0].rn === undefined) {
                        let first = (page - 1) * length + 1;
                        for (let record of data) {
                            record.rn = first++;
                        }
                    }
                    return {
                        page,
                        pages: Math.ceil(total / length),
                        limit: length,
                        total,
                        data,
                    };
                });
            }
        });
    }
    _handleAggregate(name, field) {
        this._selects = name + "(" + this.backquote(field) + ") as " +
            this.backquote("num");
        return this._handleSelect().then(data => {
            return parseFloat(data[0].num);
        });
    }
    _handleSelect() {
        this.sql = this.getSelectSQL();
        return this.query(this.sql, this._bindings).then(query => {
            this.bindings = Object.assign([], this._bindings);
            return query.data;
        });
    }
    getSelectSQL() {
        return this.adapter.getSelectSQL(this);
    }
}
exports.Query = Query;
//# sourceMappingURL=Query.js.map