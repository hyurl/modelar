import { DB, i } from "./DB";
import { PaginatedRecords } from "./interfaces";
import { InsertionError, UpdateError } from "./Errors";
import fill = require("lodash/fill");

/**
 * *Query Builder and beyond.*
 * 
 * This class provides a bunch of methods with Object-Oriented features to 
 * generate SQL statements and handle data in a more easier and efficient way.
 */
export class Query extends DB {
    /** The table that this query binds to. */
    table: string;

    /** @private */
    private _selects: string = "*";
    /** @private */
    private _distinct: string = "";
    /** @private */
    private _join: string = "";
    /** @private */
    private _where: string = "";
    /** @private */
    private _orderBy: string = "";
    /** @private */
    private _groupBy: string = "";
    /** @private */
    private _having: string = "";
    /** @private */
    private _limit: string | number | [number, number] = "";
    /** @private */
    private _union: string = "";
    /** @private */
    private _bindings: any[] = [];

    /** Creates a new Query instance with a specified table name. */
    constructor(table = "") {
        super();
        this.from(table);
    }

    /**
     * Treats the given string as a field and keep its form in where or join 
     * clause.
     * @deprecated use tagged template string instead.
     */
    field(name: string) {
        return i`${name}`;
    }

    /** Sets what fields that need to be fetched. */
    select(...fields: string[]): this;
    select(fields: string[]): this;
    select() {
        let fields = arguments[0] instanceof Array
            ? arguments[0]
            : Array.from(arguments);

        fields = fields.map(field => this.backquote(field));
        this._selects = fields.join(", ");

        return this;
    }

    /** Sets the table name(s) that the current instance binds to. */
    from(...tables: string[]): this;
    from(tables: string[]): this;
    from(): this {
        if (arguments.length > 1) {
            this.table = Array.from(arguments).join(", ");
        } else if (arguments[0] instanceof Array) {
            this.table = arguments[0].join(", ");
        } else {
            this.table = arguments[0];
        }

        return this;
    }

    /** Sets a `inner join...` clause for the SQL statement. */
    join(table: string, field1: string, field2: string): this;
    join(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): this;
    /**
     * Sets a `inner join...` clause for the SQL statement with multiple 
     * fields.
     */
    join(table: string, fields: { [field: string]: any }): this;
    /**
     * Sets a `inner join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    join(table: string, nested: (this: Query, query: Query) => void): this;
    join(table) {
        return this._handleJoin(table, "inner", ...Array.from(arguments).slice(1));
    }

    /** Sets a `left join...` clause for the SQL statement. */
    leftJoin(table: string, field1: string, field2: string): this;
    leftJoin(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): this;
    /**
     * Sets a `left join...` clause for the SQL statement with multiple 
     * fields.
     */
    leftJoin(table: string, fields: { [field: string]: any }): this;
    /**
     * Sets a `left join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    leftJoin(table: string, nested: (this: Query, query: Query) => void): this;
    leftJoin(table) {
        return this._handleJoin(table, "left", ...Array.from(arguments).slice(1));
    }

    /** Sets a `right join...` clause for the SQL statement. */
    rightJoin(table: string, field1: string, field2: string): this;
    rightJoin(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): this;
    /**
     * Sets a `right join...` clause for the SQL statement with multiple 
     * fields.
     */
    rightJoin(table: string, fields: { [field: string]: any }): this;
    /**
     * Sets a `right join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    rightJoin(table: string, nested: (this: Query, query: Query) => void): this;
    rightJoin(table) {
        return this._handleJoin(table, "right", ...Array.from(arguments).slice(1));
    }

    /** Sets a `full join...` clause for the SQL statement. */
    fullJoin(table: string, field1: string, field2: string): this;
    fullJoin(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): this;
    /**
     * Sets a `full join...` clause for the SQL statement with multiple 
     * fields.
     */
    fullJoin(table: string, fields: { [field: string]: any }): this;
    /**
     * Sets a `full join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    fullJoin(table: string, nested: (this: Query, query: Query) => void): this;
    fullJoin(table) {
        return this._handleJoin(table, "full", ...Array.from(arguments).slice(1));
    }

    /** Sets a `cross join...` clause for the SQL statement. */
    crossJoin(table: string, field1: string, field2: string): this;
    crossJoin(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): this;
    /**
     * Sets a `cross join...` clause for the SQL statement with multiple 
     * fields.
     */
    crossJoin(table: string, fields: { [field: string]: any }): this;
    /**
     * Sets a `cross join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    crossJoin(table: string, nested: (this: Query, query: Query) => void): this;
    crossJoin(table) {
        return this._handleJoin(table, "cross", ...Array.from(arguments).slice(1));
    }

    /** @private */
    private _handleJoin(table: string, type: string, ...args): this {
        if (!this._join) { // One join.
            this._join = this.backquote(this.table);
        } else { // Multiple joins.
            this._join = "(" + this._join + ")";
        }

        this._join += ` ${type} join ${this.backquote(table)} on `;

        if (args.length == 1) {
            if (typeof args[0] == "object") { // multiple fields.
                let joins: string[] = [];

                for (let field in args[0]) {
                    let value = args[0][field],
                        statement = this.backquote(field) + " = ";

                    if (value instanceof DB.Identifier) {
                        statement += this.backquote(value);
                    } else {
                        statement += "?";
                        this._bindings.push(value);
                    }

                    joins.push(statement);
                }

                this._join += joins.join(" and ");
            } else if (typeof args[0] == "function") { // nested query.
                let cb: Function = args[0],
                    query = new Query().use(this); // new instance for nested scope.

                cb.call(query, query);

                if (query._where) {
                    this._join += query._where;
                    this._bindings = this._bindings.concat(query._bindings);
                }
            }
        } else {
            let field1: string = args[0],
                op: string = args.length == 2 ? "=" : args[1],
                field2: string = args.length == 2 ? args[1] : args[2];

            this._join += this.backquote(field1)
                + " " + op + " "
                + this.backquote(field2);
        }

        return this;
    }

    /** Sets a `where...` clause with an ES6 `tagged template` string. */
    where(clause: DB.Statement): this;
    /** Sets a `where...` clause for the SQL statement with a nested query. */
    where(nested: (this: Query, query: Query) => void): this;
    where(field: string, nested: (this: Query, query: Query) => void): this;
    where(
        field: string,
        operator: string,
        nested: (this: Query, query: Query) => void
    ): this;
    /** Sets a `where...` clause for the SQL statement. */
    where(field: string, value: any): this;
    where(field: string, operator: string, value: any): this;
    /** Sets a `where...` clause for the SQL statement with multiple fields. */
    where(fields: { [field: string]: any }): this;
    where(field, operator = null, value = undefined) {
        let isTpl = field instanceof DB.Statement;

        if (typeof field === "object" && !isTpl) {
            for (let key in field) {
                this.where(key, "=", field[key]);
            }
        } else {
            if (this._where) this._where += " and ";
            if (isTpl) {
                let { sql, bindings } = this.processStatement(field);
                this._where += sql;
                this._bindings = this._bindings.concat(bindings);
            } else if (field instanceof Function) {
                this._handleNestedWhere(field);
            } else if (operator instanceof Function) {
                this._handleWhereChild(field, operator);
            } else if (value instanceof Function) {
                this._handleWhereChild(field, value, operator);
            } else {
                this._handleWhere(field, operator, value);
            }
        }
        return this;
    }

    /** Sets a `where...or...` clause with an ES6 `tagged template` string. */
    orWhere(clause: DB.Statement): this;
    /**
     * Sets a `where...or...` clause for the SQL statement with a nested query.
     */
    orWhere(nested: (this: Query, query: Query) => void): this;
    orWhere(field: string, nested: (this: Query, query: Query) => void): this;
    orWhere(
        field: string,
        operator: string,
        nested: (this: Query, query: Query) => void
    ): this;
    /** Sets a `where...or...` clause for the SQL statement. */
    orWhere(field: string, value: any): this;
    orWhere(field: string, operator: string, value: any): this;
    /**
     * Sets a `where...or...` clause for the SQL statement with multiple fields.
     */
    orWhere(fields: { [field: string]: any }): this;
    orWhere(field, operator = null, value = undefined) {
        let isTpl = field instanceof DB.Statement;

        if (typeof field == "object" && !isTpl) {
            for (let key in field) {
                this.orWhere(key, "=", field[key]);
            }
        } else {
            if (this._where) this._where += " or ";
            if (isTpl) {
                let { sql, bindings } = this.processStatement(field);
                this._where += sql;
                this._bindings = this._bindings.concat(bindings);
            } else if (field instanceof Function) {
                this._handleNestedWhere(field);
            } else if (operator instanceof Function) {
                this._handleWhereChild(field, operator);
            } else if (value instanceof Function) {
                this._handleWhereChild(field, value, operator);
            } else {
                this._handleWhere(field, operator, value);
            }
        }
        return this;
    }

    /** @private */
    private _handleWhere(field: string, operator: string, value?: any): this {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }

        this._where += this.backquote(field) + " " + operator;

        if (value instanceof DB.Identifier) {
            this._where += " " + this.backquote(value);
        } else {
            this._where += " ?";
            this._bindings.push(value);
        }

        return this;
    }

    /** @private */
    private _handleNestedWhere(cb: (query: Query) => void): this {
        let query = new Query().use(this); // new instance for nested scope.
        cb.call(query, query);
        if (query._where) {
            this._where += "(" + query._where + ")";
            this._bindings = this._bindings.concat(query._bindings);
        }
        return this;
    }

    /** @private */
    private _handleWhereChild(
        field: string,
        cb: (query: Query) => void,
        operator = "="
    ): this {
        let query = this._getQueryBy(cb);
        this._where += this.backquote(field) + ` ${operator} (${query.sql})`;
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

    /** @private */
    private _getQueryBy(cb: (query: Query) => void): Query {
        let query = new Query().use(this); // Create a new instance for nested scope.
        cb.call(query, query);
        query.sql = query.getSelectSQL();
        return query; // Generate SQL statement.
    }

    /** Sets a `where...between...` clause for the SQL statement. */
    whereBetween(field: string, [min, max]: [number, number]): this {
        return this._handleBetween(field, [min, max]);
    }

    /** Sets a `where...not between...` clause for the SQL statement. */
    whereNotBetween(field: string, [min, max]: [number, number]): this {
        return this._handleBetween(field, [min, max], false);
    }

    /** Sets a `where...or...between...` clause for the SQL statement. */
    orWhereBetween(field: string, [min, max]: [number, number]): this {
        return this._handleBetween(field, [min, max], true, "or");
    }

    /** Sets a `where...or...not between...` clause for the SQL statement. */
    orWhereNotBetween(field: string, [min, max]: [number, number]): this {
        return this._handleBetween(field, [min, max], false, "or");
    }

    /** @private */
    private _handleBetween(
        field: string,
        [min, max]: [number, number],
        between = true,
        conj = "and"
    ): this {
        if (this._where) this._where += ` ${conj} `;
        this._where += this.backquote(field) + (between ? "" : " not")
            + " between ? and ?";
        this._bindings = this._bindings.concat([min, max]);
        return this;
    }

    /**
     * Sets a `where...in...` clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    whereIn(field: string, values: any[]): this;
    /**
     * Sets a `where...in...` clause for the SQL statement with a nested 
     * query.
     */
    whereIn(field: string, nested: (this: Query, query: Query) => void): this;
    whereIn(field, values) {
        return this._handleIn(field, values);
    }

    /**
     * Sets a `where...not in...` clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    whereNotIn(field: string, values: any[]): this;
    /**
     * Sets a `where...not in...` clause for the SQL statement with a nested 
     * query.
     */
    whereNotIn(field: string, nested: (this: Query, query: Query) => void): this;
    whereNotIn(field, values) {
        return this._handleIn(field, values, false);
    }

    /**
     * Sets a `where...or...in...` clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    orWhereIn(field: string, values: any[]): this;
    /**
     * Sets a `where...or...in...` clause for the SQL statement with a nested 
     * query.
     */
    orWhereIn(field: string, nested: (this: Query, query: Query) => void): this;
    orWhereIn(field, values) {
        return this._handleIn(field, values, true, "or");
    }

    /**
     * Sets a `where...or...not in...` clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    orWhereNotIn(field: string, values: any[]): this;
    /**
     * Sets a `where...or...not in...` clause for the SQL statement with a 
     * nested query.
     */
    orWhereNotIn(
        field: string,
        nested: (this: Query, query: Query) => void
    ): this;
    orWhereNotIn(field, values) {
        return this._handleIn(field, values, false, "or");
    }

    /** @private */
    private _handleIn(
        field: string,
        values: any[] | ((query: Query) => void),
        isIn = true,
        conj = "and"
    ): this {
        if (this._where) this._where += ` ${conj} `;
        if (values instanceof Function) {
            return this._handleInChild(field, values, isIn);
        } else {
            let _values = fill(Array(values.length), "?");
            this._where += this.backquote(field) + (isIn ? "" : " not")
                + " in (" + _values.join(", ") + ")";
            this._bindings = this._bindings.concat(values);
            return this;
        }
    }

    /** @private */
    private _handleInChild(
        field: string,
        cb: (query: Query) => void,
        isIn = true
    ): this {
        let query = this._getQueryBy(cb);
        this._where += this.backquote(field) + (isIn ? "" : " not")
            + " in (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

    /** Sets a `where...is null` clause for the SQL statement. */
    whereNull(field: string): this {
        return this._handleWhereNull(field);
    }

    /** Sets a `where...is not null` clause for the SQL statement. */
    whereNotNull(field: string): this {
        return this._handleWhereNull(field, false);
    }

    /** Sets a `where...or...is null` clause for the SQL statement. */
    orWhereNull(field: string): this {
        return this._handleWhereNull(field, true, "or");
    }

    /** Sets a `where...or...is not null` clause for the SQL statement. */
    orWhereNotNull(field: string): this {
        return this._handleWhereNull(field, false, "or");
    }

    /** @private */
    private _handleWhereNull(field: string, isNull = true, conj = "and"): this {
        if (this._where) this._where += ` ${conj} `;
        this._where += this.backquote(field) + " is " + (isNull ? "" : "not ")
            + "null";
        return this;
    }

    /**
     * Sets a `where exists...` clause for the SQL statement with a nested 
     * query.
     */
    whereExists(nested: (this: Query, query: Query) => void): this {
        return this._handleExists(nested);
    }

    /**
     * Sets a `where not exists...` clause for the SQL statement with a nested 
     * query.
     */
    whereNotExists(nested: (this: Query, query: Query) => void): this {
        return this._handleExists(nested, false);
    }

    /**
     * Sets a `where...or exists...` clause for the SQL statement with a 
     * nested query.
     */
    orWhereExists(nested: (this: Query, query: Query) => void): this {
        return this._handleExists(nested, true, "or");
    }

    /**
     * Sets a `where...or not exists...` clause for the SQL statement with a 
     * nested query.
     */
    orWhereNotExists(nested: (this: Query, query: Query) => void): this {
        return this._handleExists(nested, false, "or");
    }

    /** @private */
    private _handleExists(
        nested: (this: Query, query: Query) => void,
        exists = true,
        conj = "and"
    ): this {
        if (this._where) this._where += ` ${conj} `;
        let query = this._getQueryBy(nested);
        this._where += (exists ? "" : "not ") + "exists (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

    /** Sets an `order by...` clause for the SQL statement. */
    orderBy(field: string, sequence?: "asc" | "desc"): this {
        let comma = this._orderBy ? ", " : "";
        this._orderBy += comma + this.backquote(field);
        if (sequence) this._orderBy += " " + sequence;
        return this;
    }

    /** Sets that records will be ordered in random sequence. */
    random(): this {
        return <this>this.adapter.random(this);
    }

    /** Sets a `group by...` clause for the SQL statement. */
    groupBy(...fields: string[]): this;
    /** Sets a `group by...` clause for the SQL statement. */
    groupBy(fields: string[]): this;
    groupBy(...fields) {
        if (fields[0] instanceof Array) fields = fields[0];
        fields = fields.map(field => this.backquote(field));
        this._groupBy = (<string[]>fields).join(", ");
        return this;
    }

    /** Sets a `having...` clause for the SQL statement. */
    having(clause: string | DB.Statement): this {
        if (clause instanceof DB.Statement) {
            let { sql, bindings } = this.processStatement(clause);
            this._having += (this._having ? " and " : "") + sql;
            this._bindings = this._bindings.concat(bindings);
        } else {
            this._having += (this._having ? " and " : "") + clause;
        }

        return this;
    }

    /** Sets a `limit...` clause for the SQL statement. */
    limit(length: number, offset?: number): this {
        return this.adapter.limit(this, length, offset) as this;
    }

    /**
     * Sets a `distinct` condition to get unique results in a select statement.
     */
    distinct(): this {
        this._distinct = "distinct";
        return this;
    }

    /**
     * Unites two SQL statements into one.
     * @param all Use `union all` to concatenate results.
     */
    union(query: string | DB.Statement | Query, all = false): this {
        if (this._union) this._union += " union ";

        if (query instanceof Query) {
            query.sql = query.getSelectSQL();
            this._union += (all ? "all " : "") + query.sql;
            this._bindings = this._bindings.concat(query._bindings);
        } else if (query instanceof DB.Statement) {
            let { sql, bindings } = this.processStatement(query);
            this._union += (all ? "all " : "") + sql;
            this._bindings = this._bindings.concat(bindings);
        } else {
            this._union += (all ? "all " : "") + query;
        }

        return this;
    }

    /** Inserts a new record into the database. */
    insert(data: { [field: string]: any } | any[]): Promise<this> {
        let bindings = [],
            fields: string[] | string = [],
            values: string[] | string = [],
            isObj = !(data instanceof Array);

        if (!Object.keys(data).length) {
            throw new InsertionError("No valid data were given for inserting.");
        }

        for (let field in data) {
            values.push("?");
            bindings.push(data[field]);

            if (isObj)
                fields.push(this.backquote(field));
        }

        if (isObj)
            fields = fields.join(", ");

        values = values.join(", ");

        this.sql = "insert into " + this.backquote(this.table)
            + " " + (isObj ? `(${fields}) ` : "") + `values (${values})`;


        // Fire event and call its listeners.
        this.emit("insert", this);

        return this.query(this.sql, bindings).then(() => {
            this.bindings = [].concat(bindings);

            // Fire event and call its listeners.
            this.emit("inserted", this);

            return this;
        });
    }

    /** Updates an existing record. */
    update(data: { [field: string]: any }): Promise<this> {
        let parts: string[] = [],
            bindings = [];

        for (let field in data) {
            parts.push(this.backquote(field) + " = ?");
            bindings.push(data[field]);
        }

        return this._handleUpdate(parts, bindings);
    }

    /** Increases a specified field with an optional step. */
    increase(field: string, step?: number): Promise<this>;
    /** Increases multiple fields at one time. */
    increase(fields: { [field: string]: number }): Promise<this>;
    increase(field: string | object, step = 1) {
        return this._handleCrease(field, step, "+");
    }

    /** Decreases a specified field with an optional step. */
    decrease(field: string, step?: number): Promise<this>;
    /** Decreases multiple fields at one time. */
    decrease(fields: { [field: string]: number }): Promise<this>;
    decrease(field: string | object, step = 1) {
        return this._handleCrease(field, step, "-");
    }

    /** @private */
    private _handleCrease(
        field: string | object,
        step: number,
        type: "+" | "-"
    ): Promise<this> {
        let data: { [field: string]: any },
            parts: string[] = [],
            bindings = [];

        if (typeof field == "object") {
            data = field;
        } else {
            data = { [field]: step };
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

    /** @private */
    private _handleUpdate(parts: string[], bindings: any[]): Promise<this> {
        if (Object.keys(parts).length === 0) {
            throw new UpdateError("No valid data were given for updating.");
        }

        bindings = bindings.concat(this._bindings);

        this.sql = `update ${this.backquote(this.table)} set `
            + parts.join(", ") + (this._where ? " where " + this._where : "");

        // Fire event and call its listeners.
        this.emit("update", this);

        return this.query(this.sql, bindings).then(() => {
            this.bindings = [].concat(bindings);

            // Fire event and call its listeners.
            this.emit("updated", this);

            return this;
        });
    }

    /** Deletes an existing record. */
    delete(): Promise<this> {
        this.sql = "delete from " + this.backquote(this.table) +
            (this._where ? " where " + this._where : "");

        // Fire event and call its listeners.
        this.emit("delete", this);

        return this.query(this.sql, this._bindings).then(() => {
            this.bindings = [].concat(this._bindings);

            // Fire event and call its listeners.
            this.emit("deleted", this);

            return this;
        });
    }

    /** Gets a record from the database. */
    get(): Promise<{ [field: string]: any }> {
        let promise = this.limit(1)._handleSelect().then(data => data[0]);

        // Fire event and call its listeners only if the current instance is 
        // the Query instance, not its subclasses' instances.
        if (!this["_isModel"])
            this.emit("get", this);

        return promise;
    }

    /** Gets all records from the database. */
    all(): Promise<any[]> {
        let promise = this._handleSelect();

        // Fire event and call its listeners only if the current instance is 
        // the Query instance, not its subclasses' instances.
        if (!this["_isModel"])
            this.emit("get", this);

        return promise.then(data => {
            return data instanceof Array ? data : [data];
        });
    }

    /** @private */
    private _handleSelect(): Promise<any[] | { [field: string]: any }> {
        this.sql = this.getSelectSQL();
        return this.query(this.sql, this._bindings).then(query => {
            this.bindings = [].concat(this._bindings);
            return query.data;
        });
    }

    /** @private */
    private _handleAggregate(name: string, field: string): Promise<number> {
        this._selects = name + "(" + this.backquote(field) + ") as "
            + this.backquote("num");
        return this._handleSelect().then(data => {
            return parseFloat(data[0].num);
        });
    }

    /**
     * Gets all counts of records or a specified field.
     * @param field Count a specified field.
     */
    count(field: string = "*"): Promise<number> {
        if (field != "*" && this._distinct)
            field = "distinct " + this.backquote(field);
        return this._handleAggregate("count", field);
    }

    /** Gets the maximum value of a specified field in the table. */
    max(field: string): Promise<number> {
        return this._handleAggregate("max", field);
    }

    /** Gets the minimum value of a specified field in the table. */
    min(field: string): Promise<number> {
        return this._handleAggregate("min", field);
    }

    /** Gets the average value of a specified field in the table. */
    avg(field: string): Promise<number> {
        return this._handleAggregate("avg", field);
    }

    /** Gets the summarized value of a specified field in the table. */
    sum(field: string): Promise<number> {
        return this._handleAggregate("sum", field);
    }

    /**
     * Processes chunked data with a specified length.
     * @param length The top limit of how many records that each chunk will 
     *  carry.
     * @param cb A function for processing every chunked data.
     */
    chunk(
        length: number,
        cb: (this: this, data: any[]) => false | void
    ): Promise<any[]> {
        let offset = 0,
            query = new Query(this.table).use(this);

        query._where = this._where;
        query._join = this._join;
        query._bindings = this._bindings;

        return query.count().then(total => {
            let loop = () => {
                return this.limit(length, offset).all().then(data => {
                    let ok: false | void = cb.call(this, data);
                    offset += length;

                    if (data.length == length && ok !== false && offset < total)
                        return loop(); // Running the function recursively.
                    else
                        return data;
                });
            };
            return loop();
        });
    }

    /**
     * Gets paginated information of all records that suit given conditions.
     * @param page The current page.
     * @param length The top limit of how many records that each page will
     *  carry.
     */
    paginate(page: number, length?: number): Promise<PaginatedRecords> {
        if (!length)
            length = parseInt(String(this._limit)) || 10;

        let offset = (page - 1) * length,
            query = new Query(this.table).use(this);

        query._where = this._where;
        query._join = this._join;
        query._bindings = this._bindings;

        // Get all counts of records.
        return query.count().then(total => {
            if (!total) { // If there is no record, return immediately.
                return {
                    page,
                    pages: 0,
                    limit: length,
                    total,
                    data: [],
                }
            } else { // If the are records, continue fetching data.
                return this.limit(length, offset).all().then(data => {
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

    /** Gets the select statement from the current instance. */
    getSelectSQL(): string {
        return this.adapter.getSelectSQL(this);
    }
}

export interface Query {
    on(
        event: "query" | "insert" | "inserted" | "update" | "updated" | "delete" | "deleted" | "get",
        listener: (thisObj: this) => void
    ): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}