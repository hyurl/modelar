"use strict";

const DB = require("./DB"); //Import DB class.

/**
 * *Query Constructor for SQL statements and beyond.*
 * 
 * This class provides a bunch of methods with Object-Oriented features to 
 * make generating SQL statements and handling data more easier and efficient.
 */
class Query extends DB {
    /**
     * Creates a new instance with a specified table name binding to it.
     * 
     * @param  {String} table [optional] The table name binds to the instance.
     */
    constructor(table = "") {
        super();
        this.__table = table;
        this.__inserts = ""; //Data of insert statement.
        this.__updates = ""; //Data of update statement.
        this.__selects = "*"; //Data of select statement.
        this.__distinct = ""; //Distinct clause.
        this.__join = ""; //Join clause.
        this.__where = ""; //Where clause.
        this.__orderBy = ""; //Order-by clause.
        this.__groupBy = ""; //Group-by clause.
        this.__having = ""; //Having clause.
        this.__limit = ""; //Limit condition.
        this.__union = ""; //Union clause.
        this.__bindings = []; //Data that bind to select statement.

        //Event handlers.
        this.__events = Object.assign({
            //This event will be fired when a SQL statement is about to be
            //executed.
            query: [],
            //This event will be fired when a new model is about to be 
            //inserted into the database.
            insert: [],
            //This event will be fired when a new model is successfully 
            //inserted into the database.
            inserted: [],
            //This event will be fired when a model is about to be updated.
            update: [],
            //This event will be fired when a model is successfully updated.
            updated: [],
            //This event will be fired when a model is about to be deleted.
            delete: [],
            //This event will be fired when a model is successfully deleted.
            deleted: [],
            //This event will be fired when a model is successfully fetched 
            //from the database.
            get: [],
        }, this.constructor.__events);
    }

    /**
     * Sets what fields that need to be fetched.
     * 
     * @param  {Any} fields A list of all target fields, each one passed as an
     *                      argument, or just pass the first argument as an 
     *                      array that carries all the field names.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    select(...fields) {
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => this.__backquote(field));
        this.__selects = fields.join(", ");
        return this;
    }

    /**
     * Sets the table name that the current instance binds to.
     * 
     * @param  {String} table The table name.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    table(table) {
        this.__table = table;
        return this;
    }

    /** An alias of Query.table() */
    from(table) {
        return this.table(table);
    }

    /**
     * Sets a inner join... clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missing, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    join(table, field1, operator, field2 = "") {
        return this.__handleJoin(table, field1, operator, field2);
    }

    /**
     * Sets a left join... clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missing, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    leftJoin(table, field1, operator, field2 = "") {
        return this.__handleJoin(table, field1, operator, field2, "left");
    }

    /**
     * Sets a right join... clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missing, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    rightJoin(table, field1, operator, field2 = "") {
        return this.__handleJoin(table, field1, operator, field2, "right");
    }

    /**
     * Sets a full join... clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missing, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    fullJoin(table, field1, operator, field2 = "") {
        return this.__handleJoin(table, field1, operator, field2, "full");
    }

    /**
     * Sets a cross join... clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missing, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    crossJoin(table, field1, operator, field2 = "") {
        return this.__handleJoin(table, field1, operator, field2, "cross");
    }

    /** Handles join clauses. */
    __handleJoin(table, field1, operator, field2, type = "inner") {
        if (!field2) {
            field2 = operator;
            operator = "=";
        }
        if (!this.__join) { //One join.
            this.__join = this.__backquote(this.__table);
        } else { //Multiple joins.
            this.__join = "(" + this.__join + ")";
        }
        this.__join += " " + type + " join " + this.__backquote(table) +
            " on " + this.__backquote(field1) + " " + operator + " " +
            this.__backquote(field2);
        return this;
    }

    /**
     * Set a where... clause for the SQL statement.
     * 
     * @param  {Any}    field    This could be a field name, or an object that
     *                           sets multiple `=` (equal) conditions for the 
     *                           clause. Or pass a callback function to 
     *                           generate nested conditions, the only argument
     *                           passed to the callback is a new Query 
     *                           instance with its features.
     * @param  {String} operator Condition operator, if the `value` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`. It is 
     *                           also possible to pass this argument a 
     *                           callback function to generate a child-SQL 
     *                           statement, the only argument passed to the 
     *                           callback is a new Query instance, so that you
     *                           can use its features to generate a SQL
     *                           statement.
     * @param  {Any}    value    [optional] A value that needs to be compared 
     *                           with `field`. If this argument is missing, 
     *                           then `operator` will replace it, and the 
     *                           operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    where(field, operator, value) {
        if (field instanceof Object && !(field instanceof Function)) {
            for (let key in field) {
                this.where(key, "=", field[key]);
            }
        } else {
            if (this.__where) this.__where += " and ";
            if (field instanceof Function) {
                this.__handleNestedWhere(field);
            } else if (operator instanceof Function) {
                this.__handleWhereChild(field, operator);
            } else {
                this.__handleWhere(field, operator, value);
            }
        }
        return this;
    }

    /**
     * Set an where...or... clause for the SQL statement.
     * 
     * @param  {Any}    field    This could be a field name, or an object that
     *                           sets multiple `=` (equal) conditions for the 
     *                           clause. Or pass a callback function to 
     *                           generate nested conditions, the only argument
     *                           passed to the callback is a new Query 
     *                           instance with its features.
     * @param  {String} operator Condition operator, if the `value` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`. It is 
     *                           also possible to pass this argument a 
     *                           callback function to generate a child-SQL 
     *                           statement, the only argument passed to the 
     *                           callback is a new Query instance, so that you
     *                           can use its features to generate a SQL
     *                           statement.
     * @param  {Any}    value    [optional] A value that needs to be compared 
     *                           with `field`. If this argument is missing, 
     *                           then `operator` will replace it, and the 
     *                           operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    orWhere(field, operator, value) {
        if (field instanceof Object && !(field instanceof Function)) {
            for (let key in field) {
                this.orWhere(key, "=", field[key]);
            }
        } else {
            if (this.__where) this.__where += " or ";
            if (field instanceof Function) {
                this.__handleNestedWhere(field);
            } else if (operator instanceof Function) {
                this.__handleWhereChild(field, operator);
            } else {
                this.__handleWhere(field, operator, value);
            }
        }
        return this;
    }

    /** Handles where (or) clauses. */
    __handleWhere(field, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        this.__where += this.__backquote(field) + " " + operator + " ?";
        this.__bindings.push(value);
        return this;
    }

    /** Handles nested where... (or...) clauses. */
    __handleNestedWhere(callback) {
        var query = new Query(); //Create a new instance for nested scope.
        callback.call(query, query);
        if (query.__where) {
            this.__where += "(" + query.__where + ")";
            this.__bindings = this.__bindings.concat(query.__bindings);
        }
        return this;
    }

    /** Handles where... child-SQL statements. */
    __handleWhereChild(field, callback) {
        var query = this.__getQueryBy(callback);
        this.__where += this.__backquote(field) + " = (" +
            query.sql + ")";
        this.__bindings = this.__bindings.concat(query.__bindings);
        return this;
    }

    /** Gets a query by a callback function. */
    __getQueryBy(callback) {
        var query = new Query(); //Create a new instance for nested scope.
        callback.call(query, query);
        return query.__generateSelectSQl(); //Generate SQL statement.
    }

    /**
     * Sets a where...between... clause for the SQL statement.
     * 
     * @param  {String} field A field name in the table that currently 
     *                        binds to.
     * @param  {Array}  range An array that carries only two elements which
     *                        represent the start point and the end point.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereBetween(field, range) {
        return this.__handleBetween(field, range);
    }

    /**
     * Sets a where...not between clause for the SQL statement.
     * 
     * @param  {String} field A field name in the table that currently 
     *                        binds to.
     * @param  {Array}  range An array that carries only two elements which
     *                        represent the start point and the end point.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotBetween(field, range) {
        return this.__handleBetween(field, range, false);
    }

    /** Handles where...(not ) between... clauses. */
    __handleBetween(field, range, between = true) {
        if (this.__where) this.__where += " and ";
        this.__where += this.__backquote(field) + (between ? "" : " not") +
            " between ? and ?";
        this.__bindings = this.__bindings.concat(range);
        return this;
    }

    /**
     * Sets a where...in... clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * @param  {Any}    values An array that carries all possible values. Or 
     *                         pass a callback function to generate child-SQL
     *                         statement, the only argument passed to the 
     *                         callback is a new Query instance, so that you 
     *                         can use its features to generate a SQL 
     *                         statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereIn(field, values) {
        return this.__handleIn(field, values);
    }

    /**
     * Sets a where...not in... clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * @param  {Any}    values An array that carries all possible values. Or 
     *                         pass a callback function to generate child-SQL
     *                         statement, the only argument passed to the 
     *                         callback is a new Query instance, so that you 
     *                         can use its features to generate a SQL 
     *                         statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotIn(field, values) {
        return this.__handleIn(field, values, false);
    }

    /** Handles where...(not ) in... clauses. */
    __handleIn(field, values, isIn = true) {
        if (this.__where) this.__where += " and ";
        if (values instanceof Function) {
            return this.__handleInChild(field, values, isIn);
        } else {
            var _values = Array(values.length).fill("?");
            this.__where += this.__backquote(field) + (isIn ? "" : " not") +
                " in (" + _values.join(", ") + ")";
            this.__bindings = this.__bindings.concat(values);
            return this;
        }
    }

    /** Handles where...in... child-SQL statements. */
    __handleInChild(field, callback, isIn = true) {
        var query = this.__getQueryBy(callback);
        this.__where += this.__backquote(field) + (isIn ? "" : " not") +
            " in (" + query.sql + ")";
        this.__bindings = this.__bindings.concat(query.__bindings);
        return this;
    }

    /**
     * Sets a where...is null clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNull(field) {
        return this.__handleWhereNull(field);
    }

    /**
     * Sets a where...is not null clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotNull(field) {
        return this.__handleWhereNull(field, false);
    }

    /** Handles where...is (not) null clauses. */
    __handleWhereNull(field, isNull = true) {
        if (this.__where) this.__where += " and ";
        this.__where += this.__backquote(field) + " is " +
            (isNull ? "" : "not ") + "null";
        return this;
    }

    /**
     * Sets a where exists... clause for the SQL statement.
     * 
     * @param  {Function} callback Pass a callback function to generate 
     *                             child-SQL statement, the only argument 
     *                             passed to the callback is a new Query 
     *                             instance, so that you can use its features 
     *                             to generate a SQL statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereExists(callback) {
        return this.__handleExists(callback);
    }

    /**
     * Sets a where not exists... clause for the SQL statement.
     * 
     * @param  {Function} callback Pass a callback function to generate 
     *                             child-SQL statement, the only argument 
     *                             passed to the callback is a new Query 
     *                             instance, so that you can use its features 
     *                             to generate a SQL statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotExists(callback) {
        return this.__handleExists(callback, false);
    }

    /** Handles where (not) exists... clauses. */
    __handleExists(callback, exists = true) {
        if (this.__where) this.__where += " and ";
        var query = this.__getQueryBy(callback);
        this.__where += (exists ? "" : "not ") + "exists (" + query.sql + ")";
        this.__bindings = this.__bindings.concat(query.__bindings);
        return this;
    }

    /**
     * Sets a order by... clause for the SQL statement.
     * 
     * @param  {String} field    A field name in the table that currently 
     *                           binds to.
     * @param  {String} sequence [optional] The way of how records ordered, it
     *                           could be either `asc` or `desc`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    orderBy(field, sequence = "") {
        var comma = this.__orderBy ? ", " : "";
        this.__orderBy += comma + this.__backquote(field);
        if (sequence) this.__orderBy += " " + sequence;
        return this;
    }

    /**
     * Sets that the records will be ordered in random sequence.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    random() {
        switch (this.__config.type) {
            case "sqlite":
            case "postgres":
                this.__orderBy = "random()";
                break;
            case "sqlserve":
                this.__orderBy = "newid()";
                break;
            case "access":
                this.__orderBy = "Rnd(`ID`)";
                break;
            default:
                this.__orderBy = "rand()";
                break;
        }
        return this;
    }

    /**
     * Sets a group by... clause for the SQL statement.
     * 
     * @param  {Any} fields A list of all target fields, each one passed as an
     *                      argument. Or just pass the first argument as an
     *                      array that carries all the field names.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    groupBy(...fields) {
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => this.__backquote(field));
        this.__groupBy = fields.join(", ");
        return this;
    }

    /**
     * Sets a having clause for the SQL statement.
     * 
     * @param  {String} raw  A SQL clause to define comparing conditions.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    having(raw) {
        this.__having += (this.__having ? " and " : "") + raw;
    }

    /**
     * Sets a limit clause for the SQL statement.
     * 
     * @param  {Number} length The top limit of how many counts 
     *                         that this query will fetch.
     * @param  {Number} offset [optional] The start point, count from `0`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    limit(length, offset = 0) {
        if (this.__config.type == "postgres")
            this.__limit = offset ? length + " offset " + offset : length;
        else if (this.__config.type == "access")
            this.__selects = "top " + length + " " + this.__selects;
        else
            this.__limit = offset ? offset + ", " + length : length;
        return this;
    }

    /**
     * Sets a distinct condition to get unique results in a select statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    distinct() {
        this.__distinct = "distinct";
        return this;
    }

    /**
     * Unites two SQL statements into one.
     * 
     * @param  {Any}     query Could be a SQL statement, or a Query instance.
     * @param  {Boolean} all   [optional] Use `union all` to concatenate 
     *                         results, default is `false`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    union(query, all = false) {
        if (query instanceof Query) {
            query.__generateSelectSQl();
            this.__union += " union " + (all ? "all " : "") + query.sql;
        } else if (typeof query == "string") {
            this.__union += " union " + (all ? "all " : "") + query;
        }
        return this;
    }

    /**
     * Inserts a new record into the database.
     * 
     * @param  {Any} data An object that carries fields and their values, or 
     *                    pass all values in an array that fulfil all the 
     *                    fields.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    insert(data) {
        var bindings = [];
        var fields = [];
        var values = [];
        var isObj = !(data instanceof Array);
        for (let field in data) {
            bindings.push(data[field]);
            if (isObj) fields.push(this.__backquote(field));
            values.push("?");
        }
        if (isObj) fields = fields.join(", ");
        values = values.join(", ");
        this.__inserts = (isObj ? "(" + fields + ") " : "") +
            "values (" + values + ")";
        this.sql = "insert into " + this.__backquote(this.__table) + " " +
            this.__inserts;
        //Fire event and trigger event handlers.
        this.trigger("insert", this);
        return this.query(this.sql, bindings).then(db => {
            this.bindings = Object.assign([], bindings);
            this.insertId = db.insertId;
            this.affectedRows = db.affectedRows;
            //Fire event and trigger event handlers.
            this.trigger("inserted", this);
            return this;
        });
    }

    /**
     * Updates an existing record.
     * 
     * @param  {Object}  data An object that carries fields and their values.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    update(data) {
        var bindings = [];
        var fields = [];
        for (let field in data) {
            bindings.push(data[field]);
            fields.push(this.__backquote(field) + " = ?");
        }
        bindings = bindings.concat(this.__bindings);
        this.__updates = fields.join(", ");
        this.sql = "update " + this.__backquote(this.__table) + " set " +
            this.__updates + (this.__where ? " where " + this.__where : "");
        //Fire event and trigger event handlers.
        this.trigger("update", this);
        return this.query(this.sql, bindings).then(db => {
            this.bindings = Object.assign([], bindings);
            this.affectedRows = db.affectedRows;
            //Fire event and trigger event handlers.
            this.trigger("updated", this);
            return this;
        });
    }

    /**
     * Deletes an existing record.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    delete() {
        this.sql = "delete from " + this.__backquote(this.__table) +
            (this.__where ? " where " + this.__where : "");
        //Fire event and trigger event handlers.
        this.trigger("delete", this);
        return this.query(this.sql, this.__bindings).then(db => {
            this.bindings = Object.assign([], this.__bindings);
            this.affectedRows = db.affectedRows;
            //Fire event and trigger event handlers.
            this.trigger("deleted", this);
            return this;
        });
    }

    /**
     * Gets a record from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the fetched data.
     */
    get() {
        var promise = this.limit(1).__handleSelect().then(data => data[0]);
        //Fire event and trigger event handlers only if the current instance 
        //is an Query instance, not its subclasses' instances.
        if (this.constructor.name == "Query")
            this.trigger("get", this);
        return promise;
    }

    /**
     * Gets all records from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is all the fetched data 
     *                   carried in an array.
     */
    all() {
        var promise = this.__handleSelect();
        //Fire event and trigger event handlers only if the current instance 
        //is an Query instance, not its subclasses' instances.
        if (this.constructor.name == "Query")
            this.trigger("get", this);
        return promise;
    }

    /**
     * Gets all counts of records or a specified filed.
     * 
     * @param {String} field [optional] Count a specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is a Number that counts
     *                   records.
     */
    count(field = "*") {
        if (field != "*" && this.__distinct)
            filed = "distinct " + this.__backquote(field);
        return this.__handleAggregate("count", field);
    }

    /**
     * Gets the maximum value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the maximum value 
     *                   fetched.
     */
    max(field) {
        return this.__handleAggregate("max", field);
    }

    /**
     * Gets the minimum value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the minimum value 
     *                   fetched.
     */
    min(field) {
        return this.__handleAggregate("min", field);
    }

    /**
     * Gets the average value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the average value 
     *                   fetched.
     */
    avg(field) {
        return this.__handleAggregate("avg", field);
    }

    /**
     * Gets the summarized value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the summarized value 
     *                   fetched.
     */
    sum(field) {
        return this.__handleAggregate("sum", field);
    }

    /**
     * Processes chunked data with a specified length.
     * 
     * @param {Number}   length   The top limit of how many records that each 
     *                            chunk will carry.
     * @param {Function} callback A function for processing every chunked 
     *                            data, the only argument passed to it is the 
     *                            data that current chunk carries. If the 
     *                            callback returns `false`, stop chunking.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to
     *                   the callback of `then()` is the last chunk of data.
     */
    chunk(length, callback) {
        var offset = 0,
            loop = () => {
                return this.limit(length, offset).all().then(data => {
                    var ok = callback.call(this, data);
                    if (data.length === length && ok !== false) {
                        offset += length;
                        //Running the function recursively.
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
     * @param  {Number} page   [optional] The current page, default is `1`.
     * @param  {Number} length [optional] The top limit of per page, default 
     *                         is `10`. Also you can call `query.limit()` to 
     *                         specify a length before calling this method.
     * 
     * @return {Promise} Returns a Promise, the only argument passes to the 
     *                   callback of `then()` is an object that carries the 
     *                   information, it includes:
     *                   * `page` The current page.
     *                   * `limit` The top limit of per page.
     *                   * `pages` A number of all record pages.
     *                   * `total` A number of all record counts.
     *                   * `data` An array that carries all fetched data.
     */
    paginate(page = 1, length = 0) {
        if (!length)
            length = parseInt(this.__limit) || 10;
        var offset = (page - 1) * length;
        var selects = this.__selects;
        //Get all counts of records.
        return this.count().then(total => {
            if (!total) { //If there is no record, return immediately.
                return {
                    page,
                    pages: 0,
                    limit: length,
                    total,
                    data: [],
                }
            } else { //If the are records, continue fetching data.
                this.__selects = selects;
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

    /** Handles aggregate functions. */
    __handleAggregate(name, filed) {
        this.__selects = name + "(" + this.__backquote(field) + ") as alias";
        this.__limit = "";
        return this.__handleSelect().then(data => data[0].alias);
    }

    /** Handles select statements. */
    __handleSelect() {
        this.__generateSelectSQl();
        return this.query(this.sql, this.__bindings).then(db => {
            this.bindings = Object.assign([], this.__bindings);
            return db.__data;
        });
    }

    /** Generating a select statement. */
    __generateSelectSQl() {
        var isCount = (/count\(distinct\s\S+\)/i).test(this.__selects);
        this.sql = "select " +
            (this.__distinct && !isCount ? "distinct " : "") +
            this.__selects + " from " +
            (!this.__join ? this.__backquote(this.__table) : "") +
            this.__join +
            (this.__where ? " where " + this.__where : "") +
            (this.__orderBy ? " order by " + this.__orderBy : "") +
            (this.__groupBy ? " group by " + this.__groupBy : "") +
            (this.__having ? "having " + this.__having : "") +
            (this.__limit ? " limit " + this.__limit : "") +
            (this.__union ? " union " + this.__union : "");
        return this;
    }
}

module.exports = Query;