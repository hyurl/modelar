import { DB } from "./DB";
import { PaginatedRecords } from "./interfaces";
import { InsertionError, UpdateError } from "./Errors";

/**
 * *Query Builder and beyond.*
 * 
 * This class provides a bunch of methods with Object-Oriented features to 
 * generate SQL statements and handle data in a more easier and efficient way.
 */
export class Query extends DB {
    /** The table that this query binds to. */
    table: string;

    private _inserts: string = "";
    private _updates: string = "";
    private _selects: string = "*";
    private _distinct: string = "";
    private _join: string = "";
    private _where: string = "";
    private _orderBy: string = "";
    private _groupBy: string = "";
    private _having: string = "";
    private _limit: string | number | [number, number] = "";
    private _union: string = "";
    private _bindings: any[] = [];
    private _isModel: boolean = false;

    /** Creates a new Query instance with a specified table name. */
    constructor(table = "") {
        super();
        this.from(table);
    }

    /**
     * Treats the given name as a field and keep its form in where or join 
     * clause.
     */
    field(name: string): Query.Field {
        return new Query.Field(name);
    }

    /** Sets what fields that need to be fetched. */
    select(fields: string[]): this;
    select(...fields: string[]): this;

    select(...args) {
        let fields = args[0] instanceof Array ? args[0] : args;
        fields = fields.map(field => this.backquote(field));
        this._selects = fields.join(", ");
        return this;
    }

    /** Sets the table name that the current instance binds to. */
    from(table: string): this;

    /** Sets multiple table names that the current instance binds to. */
    from(tables: string[]): this;
    from(...tables: string[]): this;

    from(...tables): this {
        if (tables.length > 1) {
            this.table = tables.join(", ");
        } else if (Array.isArray(tables[0])) {
            this.table = tables[0].join(", ");
        } else {
            this.table = tables[0];
        }

        return this;
    }

    /**
     * Sets a `inner join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    join(table: string, nested: (query: Query) => void): this;

    /**
     * Sets a `inner join...` clause for the SQL statement with multiple 
     * fields.
     */
    join(table: string, fields: { [field: string]: any }): this;

    /** Sets a `inner join...` clause for the SQL statement. */
    join(table: string, field1: string, field2: string): this;

    /** Sets a `inner join...` clause for the SQL statement. */
    join(table: string, field1: string, operator: string, field2: string): this;

    join(table, ...args) {
        return this._handleJoin(table, "inner", ...args);
    }

    /**
     * Sets a `left join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    leftJoin(table: string, nested: (query: Query) => void): this;

    /**
     * Sets a `left join...` clause for the SQL statement with multiple 
     * fields.
     */
    leftJoin(table: string, fields: { [field: string]: any }): this;

    /** Sets a `left join...` clause for the SQL statement. */
    leftJoin(table: string, field1: string, field2: string): this;

    /** Sets a `left join...` clause for the SQL statement. */
    leftJoin(table: string, field1: string, operator: string, field2: string): this;

    leftJoin(table, ...args) {
        return this._handleJoin(table, "left", ...args);
    }

    /**
     * Sets a `right join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    rightJoin(table: string, nested: (query: Query) => void): this;

    /**
     * Sets a `right join...` clause for the SQL statement with multiple 
     * fields.
     */
    rightJoin(table: string, fields: { [field: string]: any }): this;

    /** Sets a `right join...` clause for the SQL statement. */
    rightJoin(table: string, field1: string, field2: string): this;

    /** Sets a `right join...` clause for the SQL statement. */
    rightJoin(table: string, field1: string, operator: string, field2: string): this;

    rightJoin(table, ...args) {
        return this._handleJoin(table, "right", ...args);
    }

    /**
     * Sets a `full join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    fullJoin(table: string, nested: (query: Query) => void): this;

    /**
     * Sets a `full join...` clause for the SQL statement with multiple 
     * fields.
     */
    fullJoin(table: string, fields: { [field: string]: any }): this;

    /** Sets a `full join...` clause for the SQL statement. */
    fullJoin(table: string, field1: string, field2: string): this;

    /** Sets a `full join...` clause for the SQL statement. */
    fullJoin(table: string, field1: string, operator: string, field2: string): this;

    fullJoin(table, ...args) {
        return this._handleJoin(table, "full", ...args);
    }

    /**
     * Sets a `cross join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    crossJoin(table: string, nested: (query: Query) => void): this;

    /**
     * Sets a `cross join...` clause for the SQL statement with multiple 
     * fields.
     */
    crossJoin(table: string, fields: { [field: string]: any }): this;

    /** Sets a `cross join...` clause for the SQL statement. */
    crossJoin(table: string, field1: string, field2: string): this;

    /** Sets a `cross join...` clause for the SQL statement. */
    crossJoin(table: string, field1: string, operator: string, field2: string): this;

    crossJoin(table, ...args) {
        return this._handleJoin(table, "cross", ...args);
    }

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

                    if (value instanceof Query.Field) {
                        statement += this.backquote(value.name);
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
        } else if (args.length == 2) { // field1 = field2
            this._join += this.backquote(args[0]) + " = " + this.backquote(args[1]);
        } else if (args.length == 3) { // field1 <operator> field2
            this._join += this.backquote(args[0])
                + " " + this.backquote(args[1]) + " "
                + this.backquote(args[2]);
        }

        return this;
    }

    /** Sets a `where...` clause for the SQL statement with a nested query. */
    where(nested: (query: Query) => void): this;

    /** Sets a `where...` clause for the SQL statement with a nested query. */
    where(field: string, nested: (query: Query) => void): this;

    /** Sets a `where...` clause for the SQL statement with a nested query. */
    where(field: string, operator: string, nested: (query: Query) => void): this;

    /** Sets a `where...` clause for the SQL statement with multiple fields. */
    where(fields: { [field: string]: any }): this;

    /** Sets a `where...` clause for the SQL statement. */
    where(field: string, value: any): this;

    /** Sets a `where...` clause for the SQL statement with an operator. */
    where(field: string, operator: string, value: any): this;

    where(field, operator = null, value = undefined) {
        if (typeof field === "object") {
            for (let key in field) {
                this.where(key, "=", field[key]);
            }
        } else {
            if (this._where) this._where += " and ";
            if (field instanceof Function) {
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

    /**
     * Sets a `where...or...` clause for the SQL statement with a nested 
     * query.
     */
    orWhere(nested: (query: Query) => void): this;

    /**
     * Sets a `where...or...` clause for the SQL statement with a nested 
     * query.
     */
    orWhere(field: string, nested: (query: Query) => void): this;

    /**
     * Sets a `where...or...` clause for the SQL statement with a nested 
     * query.
     */
    orWhere(field: string, operator: string, nested: (query: Query) => void): this;

    /** Sets a `where...or...` clause for the SQL statement. */
    orWhere(field: string, value: any): this;

    /** Sets a `where...or...` clause for the SQL statement with an operator. */
    orWhere(field: string, operator: string, value: any): this;

    /**
     * Sets a `where...or...` clause for the SQL statement with multiple fields.
     */
    orWhere(fields: { [field: string]: any }): this;

    orWhere(field, operator = null, value = undefined) {
        if (typeof field === "object") {
            for (let key in field) {
                this.orWhere(key, "=", field[key]);
            }
        } else {
            if (this._where) this._where += " or ";
            if (field instanceof Function) {
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

    private _handleWhere(field: string, operator: string, value?: any): this {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }

        this._where += this.backquote(field) + " " + operator;

        if (value instanceof Query.Field) {
            this._where += " " + this.backquote(value.name);
        } else {
            this._where += " ?";
            this._bindings.push(value);
        }
        return this;
    }

    private _handleNestedWhere(cb: (query: Query) => void): this {
        let query = new Query().use(this); // new instance for nested scope.
        cb.call(query, query);
        if (query._where) {
            this._where += "(" + query._where + ")";
            this._bindings = this._bindings.concat(query._bindings);
        }
        return this;
    }

    private _handleWhereChild(field: string, cb: (query: Query) => void, operator = "="): this {
        let query = this._getQueryBy(cb);
        this._where += this.backquote(field) + ` ${operator} (${query.sql})`;
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

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

    private _handleBetween(field: string, [min, max]: [number, number], between = true, conj = "and"): this {
        if (this._where) this._where += ` ${conj} `;
        this._where += this.backquote(field) + (between ? "" : " not") +
            " between ? and ?";
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
    whereIn(field: string, nested: (query: Query) => void): this;

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
    whereNotIn(field: string, nested: (query: Query) => void): this;

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
    orWhereIn(field: string, nested: (query: Query) => void): this;

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
    orWhereNotIn(field: string, nested: (query: Query) => void): this;

    orWhereNotIn(field, values) {
        return this._handleIn(field, values, false, "or");
    }

    private _handleIn(field: string, values: any[] | ((query: Query) => void), isIn = true, conj = "and"): this {
        if (this._where) this._where += ` ${conj} `;
        if (values instanceof Function) {
            return this._handleInChild(field, values, isIn);
        } else {
            let _values = Array(values.length).fill("?");
            this._where += this.backquote(field) + (isIn ? "" : " not") +
                " in (" + _values.join(", ") + ")";
            this._bindings = this._bindings.concat(values);
            return this;
        }
    }

    private _handleInChild(field: string, cb: (query: Query) => void, isIn = true): this {
        let query = this._getQueryBy(cb);
        this._where += this.backquote(field) + (isIn ? "" : " not") +
            " in (" + query.sql + ")";
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

    private _handleWhereNull(field: string, isNull = true, conj = "and"): this {
        if (this._where) this._where += ` ${conj} `;
        this._where += this.backquote(field) + " is " +
            (isNull ? "" : "not ") + "null";
        return this;
    }

    /**
     * Sets a `where exists...` clause for the SQL statement with a nested 
     * query.
     */
    whereExists(nested: (query: Query) => void): this {
        return this._handleExists(nested);
    }

    /**
     * Sets a `where not exists...` clause for the SQL statement with a nested 
     * query.
     */
    whereNotExists(nested: (query: Query) => void): this {
        return this._handleExists(nested, false);
    }

    /**
     * Sets a `where...or exists...` clause for the SQL statement with a 
     * nested query.
     */
    orWhereExists(nested: (query: Query) => void): this {
        return this._handleExists(nested, true, "or");
    }

    /**
     * Sets a `where...or not exists...` clause for the SQL statement with a 
     * nested query.
     */
    orWhereNotExists(nested: (query: Query) => void): this {
        return this._handleExists(nested, false, "or");
    }

    private _handleExists(nested: (query: Query) => void, exists = true, conj = "and"): this {
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
    groupBy(fields: string[]): this;

    /** Sets a `group by...` clause for the SQL statement. */
    groupBy(...fields: string[]): this;

    groupBy(...fields) {
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => this.backquote(field));
        this._groupBy = fields.join(", ");
        return this;
    }

    /** Sets a `having...` clause for the SQL statement. */
    having(raw: string): this {
        this._having += (this._having ? " and " : "") + raw;
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
    union(query: string | Query, all = false): this {
        if (this._union) this._union += " union ";

        if (query instanceof Query) {
            query.sql = query.getSelectSQL();
            this._union += (all ? "all " : "") + query.sql;
            this._bindings = this._bindings.concat(query._bindings);
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
            isObj = !Array.isArray(data);

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

        this._inserts = (isObj ? `(${fields}) ` : "") + `values (${values})`;
        this.sql = "insert into " + this.backquote(this.table) + " " +
            this._inserts;

        // Fire event and call its listeners.
        this.emit("insert", this);

        return this.query(this.sql, bindings).then(() => {
            this.bindings = Object.assign([], bindings);

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

    /** Increases multiple fields at one time. */
    increase(fields: { [field: string]: number }): Promise<this>;

    /** Increases a specified field with an optional step. */
    increase(field: string, step?: number): Promise<this>;

    increase(field: string | object, step = 1) {
        return this._handleCrease(field, step, "+");
    }

    /** Decreases multiple fields at one time. */
    decrease(fields: { [field: string]: number }): Promise<this>;

    /** Decreases a specified field with an optional step. */
    decrease(field: string, step?: number): Promise<this>;

    decrease(field: string | object, step = 1) {
        return this._handleCrease(field, step, "-");
    }

    private _handleCrease(field: string | object, step: number, type: "+" | "-"): Promise<this> {
        let data: { [field: string]: any },
            parts: string[] = [],
            bindings = [];

        if (typeof field == "object") {
            data = field;
        } else {
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

    private _handleUpdate(parts: string[], bindings: any[]): Promise<this> {
        if (Object.keys(parts).length === 0) {
            throw new UpdateError("No valid data were given for updating.");
        }

        bindings = bindings.concat(this._bindings);

        this._updates = parts.join(", ");
        this.sql = `update ${this.backquote(this.table)} set ` +
            this._updates + (this._where ? " where " + this._where : "");

        // Fire event and call its listeners.
        this.emit("update", this);

        return this.query(this.sql, bindings).then(() => {
            this.bindings = Object.assign([], bindings);

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
            this.bindings = Object.assign([], this._bindings);

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
        if (!this._isModel)
            this.emit("get", this);

        return promise;
    }

    /** Gets all records from the database. */
    all(): Promise<any[]> {
        let promise = this._handleSelect();

        // Fire event and call its listeners only if the current instance is 
        // the Query instance, not its subclasses' instances.
        if (!this._isModel)
            this.emit("get", this);

        return promise.then(data => {
            return data instanceof Array ? data : [data];
        });
    }

    /**
     * Gets all counts of records or a specified field.
     * @param field Count a specified field.
     */
    count(field = "*"): Promise<number> {
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
    chunk(length: number, cb: (data: any[]) => false | void): Promise<any[]> {
        let offset = 0,
            loop = () => {
                return this.limit(length, offset).all().then(data => {
                    let ok = cb.call(this, data);
                    if (data.length === length && ok !== false) {
                        offset += length;
                        // Running the function recursively.
                        return loop();
                    } else {
                        return data;
                    }
                });
            };
        return loop();
    }

    /**
     * Gets paginated information of all records that suit given conditions.
     * @param page The current page.
     * @param length The top limit of how many records that each page will
     *  carry.
     */
    paginate(page: number, length?: number): Promise<PaginatedRecords> {
        if (!length)
            length = parseInt(<string>this._limit) || 10;

        let offset = (page - 1) * length,
            query = new Query(this.table).use(this);

        query._where = this._where;
        query._join = this._join;

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

    private _handleAggregate(name: string, field: string): Promise<number> {
        this._selects = name + "(" + this.backquote(field) + ") as " +
            this.backquote("num");
        return this._handleSelect().then(data => {
            return parseFloat(data[0].num);
        });
    }

    private _handleSelect(): Promise<any[] | { [field: string]: any }> {
        this.sql = this.getSelectSQL();
        return this.query(this.sql, this._bindings).then(query => {
            this.bindings = Object.assign([], this._bindings);
            return query.data;
        });
    }

    /** Gets the select statement from the current instance. */
    getSelectSQL(): string {
        return this.adapter.getSelectSQL(this);
    }
}

export namespace Query {
    export class Field {
        name: string;

        constructor(name: string) {
            this.name = name;
        }
    }
}