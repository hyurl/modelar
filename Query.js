const DB = require("./DB");

/**
 * *Query Builder and beyond.*
 * 
 * This class provides a bunch of methods with Object-Oriented features to 
 * generate SQL statements and handle data in a more easier and efficient way.
 */
class Query extends DB {
    /**
     * Creates a new Query instance with a specified table name.
     * 
     * @param  {string}  [table]  The table name bound to the instance.
     */
    constructor(table = "") {
        super();
        this._table = table; // The table that this query binds to.
        this._inserts = ""; // Data of insert statement.
        this._updates = ""; // Data of update statement.
        this._selects = "*"; // Data of select statement.
        this._distinct = ""; // Distinct clause.
        this._join = ""; // Join clause.
        this._where = ""; // Where clause.
        this._orderBy = ""; // Order-by clause.
        this._groupBy = ""; // Group-by clause.
        this._having = ""; // Having clause.
        this._limit = ""; // Limit condition.
        this._union = ""; // Union clause.
        this._bindings = []; // Data bound to select statement.
    }

    /**
     * Sets what fields that need to be fetched.
     * 
     * @param  {string[]}  fields  A list of all target fields, each one 
     *  passed as an argument, or just pass the first argument as an array 
     *  that carries all the field names.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    select(...fields) {
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => this.backquote(field));
        this._selects = fields.join(", ");
        return this;
    }

    /**
     * Sets the table name that the current instance binds to.
     * 
     * @param  {string}  table  The table name.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    table(table) {
        this._table = table;
        return this;
    }

    /** An alias of query.table() */
    from(table) {
        return this.table(table);
    }

    /**
     * Sets a inner join... clause for the SQL statement.
     * 
     * @param  {string}  table  A table name that needs to be joined with.
     * 
     * @param  {string}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {string}  operator  Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {string}  [field2]  A field in `table` that needs to be 
     *  compared with `field1`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    join(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2);
    }

    /**
     * Sets a left join... clause for the SQL statement.
     * 
     * @param  {string}  table  A table name that needs to be joined with.
     * 
     * @param  {string}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {string}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {string}  [field2]  A field in `table` that needs to be 
     *  compared with `field1`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    leftJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "left");
    }

    /**
     * Sets a right join... clause for the SQL statement.
     * 
     * @param  {string}  table  A table name that needs to be joined with.
     * 
     * @param  {string}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {string}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {string}  [field2]  A field in `table` that needs to be 
     *  compared with `field1`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    rightJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "right");
    }

    /**
     * Sets a full join... clause for the SQL statement.
     * 
     * @param  {string}  table  A table name that needs to be joined with.
     * 
     * @param  {string}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {string}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {string}  [field2]  A field in `table` that needs to be 
     *  compared with `field1`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    fullJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "full");
    }

    /**
     * Sets a cross join... clause for the SQL statement.
     * 
     * @param  {string}  table  A table name that needs to be joined with.
     * 
     * @param  {string}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {string}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {string}  [field2]  A field in `table` that needs to be 
     *  compared with `field1`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    crossJoin(table, field1, operator, field2 = "") {
        return this._handleJoin(table, field1, operator, field2, "cross");
    }

    /** Handles join clauses. */
    _handleJoin(table, field1, operator, field2, type = "inner") {
        if (!field2) {
            field2 = operator;
            operator = "=";
        }
        if (!this._join) { // One join.
            this._join = this.backquote(this._table);
        } else { // Multiple joins.
            this._join = "(" + this._join + ")";
        }
        this._join += " " + type + " join " + this.backquote(table) +
            " on " + this.backquote(field1) + " " + operator + " " +
            this.backquote(field2);
        return this;
    }

    /**
     * Sets a where... clause for the SQL statement.
     * 
     * @param  {string|Function|object}  field  This could be a field name, or
     *  an object that sets multiple `=` (equal) conditions for the clause. Or
     *  pass a callback function to generate nested conditions, the only 
     *  argument passed to the callback is a new Query instance with all 
     *  features.
     * 
     * @param  {string|Function}  [operator]  Condition operator, if the 
     *  `value` isn't passed, then this argument will replace it, and the 
     *  operator will become an `=`. It is also possible to pass this argument
     *  a callback function to generate a child-SQL statement, the only 
     *  argument passed to the callback is a new Query instance, so that you
     *  can use its features to generate a SQL statement.
     * 
     * @param  {string|number|Function}  [value]  A value that needs to be compared 
     *  with `field`. If this argument is missing, then `operator` will 
     *  replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
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
     * Sets a where...or... clause for the SQL statement.
     * 
     * @param  {string|Function|object}  field  This could be a field name, or
     *  an object that sets multiple `=` (equal) conditions for the clause. Or
     *  pass a callback function to generate nested conditions, the only 
     *  argument passed to the callback is a new Query instance with all 
     *  features.
     * 
     * @param  {string|Function}  [operator]  Condition operator, if the 
     *  `value` isn't passed, then this argument will replace it, and the 
     *  operator will become an `=`. It is also possible to pass this argument
     *  a callback function to generate a child-SQL statement, the only 
     *  argument passed to the callback is a new Query instance, so that you
     *  can use its features to generate a SQL statement.
     * 
     * @param  {string|number|Function}  [value]  A value that needs to be compared 
     *  with `field`. If this argument is missing, then `operator` will 
     *  replace it, and the operator will become an `=`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
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

    /** Handles where (or) clauses. */
    _handleWhere(field, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        this._where += this.backquote(field) + " " + operator + " ?";
        this._bindings.push(value);
        return this;
    }

    /** Handles nested where...(or...) clauses. */
    _handleNestedWhere(callback) {
        var query = new Query().use(this); // Create a new instance for nested scope.
        callback.call(query, query);
        if (query._where) {
            this._where += "(" + query._where + ")";
            this._bindings = this._bindings.concat(query._bindings);
        }
        return this;
    }

    /** Handles where... child-SQL statements. */
    _handleWhereChild(field, callback, operator = "=") {
        var query = this._getQueryBy(callback);
        this._where += this.backquote(field) + ` ${operator} (${query.sql})`;
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

    /** Gets a query by a callback function. */
    _getQueryBy(callback) {
        var query = new Query().use(this); // Create a new instance for nested scope.
        callback.call(query, query);
        query.sql = query.getSelectSQL();
        return query; // Generate SQL statement.
    }

    /**
     * Sets a where...between... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {[number, number]}  range  An array that carries only two elements which
     *  represent the start point and the end point.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereBetween(field, range) {
        return this._handleBetween(field, range);
    }

    /**
     * Sets a where...not between... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {[number, number]}  range  An array that carries only two elements which
     *  represent the start point and the end point.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereNotBetween(field, range) {
        return this._handleBetween(field, range, false);
    }

    /**
     * Sets a where...or...between... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {[number, number]}  range  An array that carries only two elements which
     *  represent the start point and the end point.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereBetween(field, range) {
        return this._handleBetween(field, range, true, "or");
    }

    /**
     * Sets a where...or... not between... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {[number, number]}  range  An array that carries only two elements which
     *  represent the start point and the end point.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereNotBetween(field, range) {
        return this._handleBetween(field, range, false, "or");
    }

    /** Handles where...(not ) between... clauses. */
    _handleBetween(field, range, between = true, conj = "and") {
        if (this._where) this._where += ` ${conj} `;
        this._where += this.backquote(field) + (between ? "" : " not") +
            " between ? and ?";
        this._bindings = this._bindings.concat(range);
        return this;
    }

    /**
     * Sets a where...in... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Function|any[]}  values  An array that carries all possible 
     *  values. Or pass a callback function to generate child-SQL statement, 
     *  the only argument passed to the callback is a new Query instance, so 
     *  that you can use its features to generate a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereIn(field, values) {
        return this._handleIn(field, values);
    }

    /**
     * Sets a where...not in... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Function|any[]}  values  An array that carries all possible 
     *  values. Or pass a callback function to generate child-SQL statement, 
     *  the only argument passed to the callback is a new Query instance, so 
     *  that you can use its features to generate a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereNotIn(field, values) {
        return this._handleIn(field, values, false);
    }

    /**
     * Sets a where...or...in... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Function|any[]}  values  An array that carries all possible 
     *  values. Or pass a callback function to generate child-SQL statement, 
     *  the only argument passed to the callback is a new Query instance, so 
     *  that you can use its features to generate a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereIn(field, values) {
        return this._handleIn(field, values, true, "or");
    }

    /**
     * Sets a where...or...not in... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Function|any[]}  values  An array that carries all possible 
     *  values. Or pass a callback function to generate child-SQL statement, 
     *  the only argument passed to the callback is a new Query instance, so 
     *  that you can use its features to generate a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereNotIn(field, values) {
        return this._handleIn(field, values, false, "or");
    }

    /** Handles where... (not ) in... clauses. */
    _handleIn(field, values, isIn = true, conj = "and") {
        if (this._where) this._where += ` ${conj} `;
        if (values instanceof Function) {
            return this._handleInChild(field, values, isIn);
        } else {
            var _values = Array(values.length).fill("?");
            this._where += this.backquote(field) + (isIn ? "" : " not") +
                " in (" + _values.join(", ") + ")";
            this._bindings = this._bindings.concat(values);
            return this;
        }
    }

    /** Handles where...in... child-SQL statements. */
    _handleInChild(field, callback, isIn = true) {
        var query = this._getQueryBy(callback);
        this._where += this.backquote(field) + (isIn ? "" : " not") +
            " in (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

    /**
     * Sets a where...is null clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently binds
     *  to.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereNull(field) {
        return this._handleWhereNull(field);
    }

    /**
     * Sets a where...is not null clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently binds
     *  to.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereNotNull(field) {
        return this._handleWhereNull(field, false);
    }

    /**
     * Sets a where...or...is null clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently binds
     *  to.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereNull(field) {
        return this._handleWhereNull(field, true, "or");
    }

    /**
     * Sets a where...or...is not null clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently binds
     *  to.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereNotNull(field) {
        return this._handleWhereNull(field, false, "or");
    }

    /** Handles where...is (not) null clauses. */
    _handleWhereNull(field, isNull = true, conj = "and") {
        if (this._where) this._where += ` ${conj} `;
        this._where += this.backquote(field) + " is " +
            (isNull ? "" : "not ") + "null";
        return this;
    }

    /**
     * Sets a where exists... clause for the SQL statement.
     * 
     * @param  {(query: Query)=>void}  callback  Pass a callback function to
     *  generate child-SQL statement, the only argument passed to the callback
     *  is a new Query instance, so that you can use its features to generate
     *  a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereExists(callback) {
        return this._handleExists(callback);
    }

    /**
     * Sets a where not exists... clause for the SQL statement.
     * 
     * @param  {(query: Query)=>void}  callback  Pass a callback function to 
     *  generate child-SQL statement, the only argument passed to the callback
     *  is a new Query instance, so that you can use its features to generate 
     *  a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    whereNotExists(callback) {
        return this._handleExists(callback, false);
    }

    /**
     * Sets a where...or exists... clause for the SQL statement.
     * 
     * @param  {(query: Query)=>void}  callback  Pass a callback function to
     *  generate child-SQL statement, the only argument passed to the callback
     *  is a new Query instance, so that you can use its features to generate
     *  a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereExists(callback) {
        return this._handleExists(callback, true, "or");
    }

    /**
     * Sets a where...or not exists... clause for the SQL statement.
     * 
     * @param  {(query: Query)=>void}  callback  Pass a callback function to
     *  generate child-SQL statement, the only argument passed to the callback
     *  is a new Query instance, so that you can use its features to generate
     *  a SQL statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orWhereNotExists(callback) {
        return this._handleExists(callback, false, "or");
    }

    /** Handles where (not) exists... clauses. */
    _handleExists(callback, exists = true, conj = "and") {
        if (this._where) this._where += ` ${conj} `;
        var query = this._getQueryBy(callback);
        this._where += (exists ? "" : "not ") + "exists (" + query.sql + ")";
        this._bindings = this._bindings.concat(query._bindings);
        return this;
    }

    /**
     * Sets an order by... clause for the SQL statement.
     * 
     * @param  {string}  field  A field name in the table that currently binds
     *  to.
     * 
     * @param  {string}  [sequence]  The way of how records are ordered, it 
     *  could be either `asc` or `desc`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    orderBy(field, sequence = "") {
        var comma = this._orderBy ? ", " : "";
        this._orderBy += comma + this.backquote(field);
        if (sequence) this._orderBy += " " + sequence;
        return this;
    }

    /**
     * Sets that records will be ordered in random sequence.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    random() {
        if (this._adapter.random instanceof Function) {
            return this._adapter.random(this);
        } else {
            this._orderBy = "random()";
            return this;
        }
    }

    /**
     * Sets a group by... clause for the SQL statement.
     * 
     * @param  {string[]}  fields  A list of all target fields, each one 
     *  passed as an argument. Or just pass the first argument as an array 
     *  that carries all the field names.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    groupBy(...fields) {
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => this.backquote(field));
        this._groupBy = fields.join(", ");
        return this;
    }

    /**
     * Sets a having... clause for the SQL statement.
     * 
     * @param  {string}  raw  A SQL clause for defining comparing conditions.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    having(raw) {
        this._having += (this._having ? " and " : "") + raw;
        return this;
    }

    /**
     * Sets a limit... clause for the SQL statement.
     * 
     * @param  {number}  length  The top limit of how many counts that this 
     *  query will fetch.
     * 
     * @param  {number}  [offset]  The start point, count from `0`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    limit(length, offset = 0) {
        if (this._adapter.limit instanceof Function) {
            return this._adapter.limit(this, length, offset);
        } else {
            this._limit = offset ? offset + ", " + length : length;
            return this;
        }
    }

    /**
     * Sets a distinct condition to get unique results in a select statement.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    distinct() {
        this._distinct = "distinct";
        return this;
    }

    /**
     * Unites two SQL statements into one.
     * 
     * @param  {string|Query}  query Could be a SQL statement, or a Query 
     *  instance.
     * 
     * @param  {boolean}  [all]  Use `union all` to concatenate results, 
     *  default is `false`.
     * 
     * @return {this} Returns the current instance for function chaining.
     */
    union(query, all = false) {
        if (query instanceof Query) {
            query.sql = query.getSelectSQL();
            this._union += " union " + (all ? "all " : "") + query.sql;
        } else if (typeof query == "string") {
            this._union += " union " + (all ? "all " : "") + query;
        }
        return this;
    }

    /**
     * Inserts a new record into the database.
     * 
     * @param  {object}  data  An object that carries fields and their values,
     *  or pass all values in an array that fulfil all the fields.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    insert(data) {
        var bindings = [],
            fields = [],
            values = [],
            isObj = !(data instanceof Array);
        if (isObj && !Object.keys(data).length || (!isObj && !data.length)) {
            throw new Error("No valid data were given for inserting.");
        }
        for (let field in data) {
            bindings.push(data[field]);
            if (isObj) fields.push(this.backquote(field));
            values.push("?");
        }
        if (isObj) fields = fields.join(", ");
        values = values.join(", ");
        this._inserts = (isObj ? `(${fields}) ` : "") + `values (${values})`;
        this.sql = `insert into ${this.backquote(this._table)} ` +
            `${this._inserts}`;
        // Fire event and call its listeners.
        this.emit("insert", this);
        return this.query(this.sql, bindings).then(query => {
            this.bindings = Object.assign([], bindings);
            // Fire event and call its listeners.
            this.emit("inserted", this);
            return this;
        });
    }

    /**
     * Updates an existing record.
     * 
     * @param  {object}  data An object that carries fields and their values.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    update(data) {
        var parts = [],
            bindings = [];
        for (let field in data) {
            parts.push(this.backquote(field) + " = ?");
            bindings.push(data[field]);
        }
        return this._handleUpdate(parts, bindings);
    }

    /**
     * Increases a specified field with a specified number.
     * 
     * @param  {string|object}  field  The field name of which record needs to
     *  be increased. It is also possible to pass this argument an object to 
     *  increase multiple fields.
     * 
     * @param  {number}  [number]  A number that needs to be raised, default 
     *  is `1`.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    increase(field, number = 1) {
        return this._handleCrease(field, number, "+");
    }

    /**
     * Decreases a specified field with a specified number.
     * 
     * @param  {string|object}  field  The field name of which record needs to
     *  be decreased. It is also possible to pass this argument an object to 
     *  decrease multiple fields.
     * 
     * @param  {number}  [number]  A number that needs to be reduced, default 
     * is `1`.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    decrease(field, number = 1) {
        return this._handleCrease(field, number, "-");
    }

    /** Handles increasing and decreasing. */
    _handleCrease(field, number, type) {
        if (typeof field == "object") {
            var data = field;
        } else {
            var data = {};
            data[field] = number;
        }
        var bindings = [];
        var parts = [];
        for (let field in data) {
            if (data[field] > 0) {
                bindings.push(data[field]);
                field = this.backquote(field);
                parts.push(`${field} = ${field} ${type} ?`);
            }
        }
        return this._handleUpdate(parts, bindings);
    }

    /** Handles update statements. */
    _handleUpdate(parts, bindings) {
        if (Object.keys(parts).length === 0) {
            throw new Error("No valid data were given for updating.");
        }
        bindings = bindings.concat(this._bindings);
        this._updates = parts.join(", ");
        this.sql = `update ${this.backquote(this._table)} set ` +
            this._updates + (this._where ? " where " + this._where : "");
        // Fire event and call its listeners.
        this.emit("update", this);
        return this.query(this.sql, bindings).then(query => {
            this.bindings = Object.assign([], bindings);
            // Fire event and call its listeners.
            this.emit("updated", this);
            return this;
        });
    }

    /**
     * Deletes an existing record.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    delete() {
        this.sql = "delete from " + this.backquote(this._table) +
            (this._where ? " where " + this._where : "");
        // Fire event and call its listeners.
        this.emit("delete", this);
        return this.query(this.sql, this._bindings).then(query => {
            this.bindings = Object.assign([], this._bindings);
            // Fire event and call its listeners.
            this.emit("deleted", this);
            return this;
        });
    }

    /**
     * Gets a record from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the fetched data.
     */
    get() {
        var promise = this.limit(1)._handleSelect().then(data => data[0]);
        // Fire event and call its listeners only if the current instance is 
        // the Query instance, not its subclasses' instances.
        if (this.constructor === Query)
            this.emit("get", this);
        return promise;
    }

    /**
     * Gets all records from the database.
     * 
     * @return {Promise<any[]>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is all the fetched data  carried in an 
     *  array.
     */
    all() {
        var promise = this._handleSelect();
        // Fire event and call its listeners only if the current instance is 
        // the Query instance, not its subclasses' instances.
        if (this.constructor === Query)
            this.emit("get", this);
        return promise;
    }

    /**
     * Gets all counts of records or a specified field.
     * 
     * @param  {string}  [field]  Count a specified field.
     * 
     * @return {Promise<number>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is a number that represents the 
     *  count of records.
     */
    count(field = "*") {
        if (field != "*" && this._distinct)
            field = "distinct " + this.backquote(field);
        return this._handleAggregate("count", field);
    }

    /**
     * Gets the maximum value of a specified field in the table.
     * 
     * @param {string} field The specified field.
     * 
     * @return {Promise<number>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the maximum value fetched.
     */
    max(field) {
        return this._handleAggregate("max", field);
    }

    /**
     * Gets the minimum value of a specified field in the table.
     * 
     * @param  {string}  field The specified field.
     * 
     * @return {Promise<number>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the minimum value fetched.
     */
    min(field) {
        return this._handleAggregate("min", field);
    }

    /**
     * Gets the average value of a specified field in the table.
     * 
     * @param  {string}  field The specified field.
     * 
     * @return {Promise<number>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the average value fetched.
     */
    avg(field) {
        return this._handleAggregate("avg", field);
    }

    /**
     * Gets the summarized value of a specified field in the table.
     * 
     * @param  {string}  field The specified field.
     * 
     * @return {Promise<number>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the summarized value fetched.
     */
    sum(field) {
        return this._handleAggregate("sum", field);
    }

    /**
     * Processes chunked data with a specified length.
     * 
     * @param  {number}  length  The top limit of how many records that each 
     *  chunk will carry.
     * 
     * @param  {(data: any[])=>void|boolean}  callback  A function for 
     *  processing every chunked data, the only argument passed to it is the 
     *  data that current chunk carries. If the callback returns `false`, stop
     *  chunking.
     * 
     * @return {Promise<any[]>} Returns a Promise, and the only argument 
     *  passed to the callback of `then()` is the last chunk of data.
     */
    chunk(length, callback) {
        var offset = 0,
            loop = () => {
                return this.limit(length, offset).all().then(data => {
                    var ok = callback.call(this, data);
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
     * 
     * @param  {number}  page The current page.
     * 
     * @param  {number}  [length]  The top limit of per page, default is `10`.
     *  Also you can call `query.limit()` to specify a length before calling 
     *  this method.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to 
     * the callback of `then()` is an object that carries the information, it 
     *  includes:
     *  * `page` The current page.
     *  * `limit` The top limit of per page.
     *  * `pages` A number of all record pages.
     *  * `total` A number of all record counts.
     *  * `data` An array that carries all fetched data.
     */
    paginate(page, length = 0) {
        if (!length)
            length = parseInt(this._limit) || 10;
        var offset = (page - 1) * length,
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

    /** Handles aggregate functions. */
    _handleAggregate(name, field) {
        this._selects = name + "(" + this.backquote(field) + ") as alias";
        this._limit = "";
        return this._handleSelect().then(data => data[0].alias || data[0].ALIAS);
    }

    /** Handles select statements. */
    _handleSelect() {
        this.sql = this.getSelectSQL();
        return this.query(this.sql, this._bindings).then(query => {
            this.bindings = Object.assign([], this._bindings);
            return query._data;
        });
    }

    /**
     * Generates a select statement.
     * 
     * @return {string} The select statement.
     */
    getSelectSQL() {
        if (this._adapter.getSelectSQL instanceof Function) {
            return this._adapter.getSelectSQL(this);
        } else {
            var isCount = (/count\(distinct\s\S+\)/i).test(this._selects);
            return "select " +
                (this._distinct && !isCount ? "distinct " : "") +
                this._selects + " from " +
                (!this._join ? this.backquote(this._table) : "") +
                this._join +
                (this._where ? " where " + this._where : "") +
                (this._orderBy ? " order by " + this._orderBy : "") +
                (this._groupBy ? " group by " + this._groupBy : "") +
                (this._having ? "having " + this._having : "") +
                (this._limit ? " limit " + this._limit : "") +
                (this._union ? " union " + this._union : "");
        }
    }
}

module.exports = Query;