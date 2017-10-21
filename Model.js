"use strict";

const Query = require("./Query");

/**
 * *Model Wrapper.*
 * 
 * This class extends from Query class, there for has all the features that 
 * Query has, and features that Query doesn't have, which makes data operation
 * more easier and efficient.
 * 
 * Also, this class implements some useful API of ES2015, like `toString()`, 
 * `valueOf()`, `toJSON()`, and `Symbol.iterator`. You can call 
 * `model.toString()` or `JSON.stringify(model)` to generate a JSON string of 
 * the model, and call `model.valueOf()` to get the data of the model. If you
 * want to list out all properties of the model data, put the model in a 
 * for...of... loop, like `for(let [field, value] of model)`.
 */
class Model extends Query {
    /**
     *  Creates a new Model instance with initial data and configurations.
     * 
     * @param  {Object}  data  [optional] Initial data of the model.
     * 
     * @param  {Object}  config  [optional] Initial configuration of the 
     *  model, they could be:
     *  * `table` The table name that the instance binds to.
     *  * `fields` Fields of the table in an array.
     *  * `primary` The primary key of the table.
     *  * `searchable` An array that carries all searchable fields, they could
     *      be used when calling `model.getMany()`.
     */
    constructor(data = {}, config = {}) {
        super(config.table || ""); // Bind the table name.
        this.__fields = config.fields || []; // Fields of the table.
        this.__primary = config.primary || ""; // The primary key.
        this.__searchable = config.searchable || []; // Searchable fields.

        // This property sets an extra where... clause for the SQL statement 
        // when updating or deleting the model.
        this.__whereState = { where: "", bindings: [] };

        // This property carries the data of the model.
        this.__data = {};

        // This property carries extra data of the model.
        // When calling model.assign(), those data which are not defined in 
        // the model.__fields will be stored in this property.
        // When inserting or updating the model, these data won't be affected.
        this.__extra = {};

        // This property carries the data that needs to be updated to the 
        // database.
        this.__modified = {};

        // Event handlers.
        this.__events = Object.assign({
            // This event will be fired when a SQL statement is about to be
            // executed.
            query: [],
            // This event will be fired when a new model is about to be 
            // inserted into the database.
            insert: [],
            // This event will be fired when a new model is successfully 
            // inserted into the database.
            inserted: [],
            // This event will be fired when a model is about to be updated.
            update: [],
            // This event will be fired when a model is successfully updated.
            updated: [],
            // This event will be fired when a model is about to be saved.
            save: [],
            // This event will be fired when a model is successfully saved.
            saved: [],
            // This event will be fired when a model is about to be deleted.
            delete: [],
            // This event will be fired when a model is successfully deleted.
            deleted: [],
            // This event will be fired when a model is successfully fetched 
            // from the database.
            get: [],
        }, this.constructor.__events);

        // Define pseudo-properties.
        this.__defineProperties(this.__fields);

        // Assign data to the instance.
        delete data[this.__primary]; // Filter primary key.
        this.assign(data, true);
    }

    /** 
     * Defines setters and getters for model fields, if they're not defined.
     */
    __defineProperties(fields) {
        for (let field of fields) {
            let hasGetter = this.__lookupGetter__(field) instanceof Function,
                hasSetter = this.__lookupSetter__(field) instanceof Function,
                isProp = this.hasOwnProperty(field);
            if (!hasGetter && !hasSetter && !isProp) {
                Object.defineProperty(this, field, {
                    // Getter
                    get: () => this.__data[field] || null,
                    // Setter
                    set: (v) => {
                        // Primary key cannot be set through pseudo-property.
                        if (field != this.__primary) {
                            this.__data[field] = v;
                            if (this.__data[this.__primary]) {
                                this.__modified[field] = v;
                            }
                        }
                    },
                });
            }
        }
    }

    /**
     * Assigns data to the model instance.
     * 
     * @param  {Object}  data  The data in a object needs to be assigned.
     * 
     * @param  {Boolean}  useSetter  [optional] Use setters (if any) to 
     *  process the data, default is `false`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    assign(data, useSetter = false) {
        if (this.__data instanceof Array) {
            // __data extends from DB class, so it could be an array.
            this.__data = {};
        }
        var isNew = !this.__data[this.__primary];
        for (let key in data) {
            if (this.__fields.includes(key)) {
                // Only accept those fields that `__fields` sets.
                if (useSetter) {
                    let set = this.__lookupSetter__(key);
                    if (set instanceof Function) {
                        set.call(this, data[key]); // Calling setter
                        continue;
                    }
                }
                this.__data[key] = data[key];
                if (!isNew && key != this.__primary) {
                    this.__modified[key] = data[key];
                }
            } else {
                this.__extra[key] = data[key];
            }
        }
        return this;
    }

    /**
     * Saves the current model, if there is not record in the database, it 
     * will be automatically inserted.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    save() {
        this.trigger("save", this); // Trigger the save event.
        var exists = this.__data[this.__primary],
            promise = exists ? this.update() : this.insert();
        return promise.then(model => {
            return this.trigger("saved", model);
        });
    }

    /*************** Rewritten methods from Query ********************/

    /**
     * Inserts the current model as a new record into the database.
     * 
     * @param  {Object}  data  An object that carries fields and their values.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    insert(data = {}) {
        this.assign(data, true);
        return super.insert(this.__data).then(model => {
            model.where(model.__primary, model.insertId);
            return model.get(); // Get final data from database.
        });
    }

    /**
     * Updates the current model.
     * 
     * @param  {Object}  data An object that carries fields and their values.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    update(data = {}) {
        this.__resetWhere();
        if (this.__whereState.where) {
            var state = this.__whereState;
            this.__where += " and " + state.where;
            this.__bindings = this.__bindings.concat(state.bindings);
        }
        delete data[this.__primary];
        this.assign(data, true);
        data = Object.assign({}, this.__modified);
        if (Object.keys(data).length === 0) {
            // If no data modified, then resolve the current model.
            return new Promise(resolve => {
                resolve(this);
            });
        } else {
            return super.update(data).then(model => {
                if (model.affectedRows == 0) {
                    // If no model is affected, throw an error.
                    throw new Error("No " + this.constructor.name +
                        " was updated by matching the given condition.");
                } else {
                    model.__resetWhere(true);
                    return model.get(); // Get final data from the database.
                }
            });
        }
    }

    /**
     * Increases a specified field with a specified number.
     * 
     * @param  {String|Object}  field  The field name of which record needs to
     *  be increased. It is also possible to pass this argument an object to 
     *  increase multiple fields.
     * 
     * @param  {Number}  number  [optional] A number that needs to be raised, 
     *  default is `1`.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    increase(field, number = 1) {
        this.__resetWhere();
        if (this.__whereState.where) {
            var state = this.__whereState;
            this.__where += " and " + state.where;
            this.__bindings = this.__bindings.concat(state.bindings);
        }
        return this.__handleCrease(field, number, "+");
    }

    /**
     * Decreases a specified field with a specified number.
     * 
     * @param  {String|Object}  field  The field name of which record needs to
     *  be decreased. It is also possible to pass this argument an object to 
     *  decrease multiple fields.
     * 
     * @param  {Number}  number  [optional] A number that needs to be reduced,
     *  default is `1`.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    decrease(field, number = 1) {
        this.__resetWhere();
        if (this.__whereState.where) {
            var state = this.__whereState;
            this.__where += " and " + state.where;
            this.__bindings = this.__bindings.concat(state.bindings);
        }
        return this.__handleCrease(field, number, "-");
    }

    /** Handles increasing and decreasing. */
    __handleCrease(field, number, type) {
        if (typeof field == "object") {
            var data = field;
        } else {
            var data = {};
            data[field] = number;
        }
        delete data[this.__primary];
        var bindings = [];
        var parts = [];
        for (let field in data) {
            if (this.__fields.includes(field) && data[field] > 0) {
                bindings.push(data[field]);
                field = this.backquote(field);
                parts.push(`${field} = ${field} ${type} ?`);
            }
        }
        return this.__handleUpdate(parts, bindings).then(model => {
            if (model.affectedRows == 0) {
                // If no model is affected, throw an error.
                throw new Error("No " + this.constructor.name +
                    " was updated by matching the given condition.");
            } else {
                model.__resetWhere(true);
                return model.get(); // Get final data from the database.
            }
        });
    }

    /**
     * Deletes the current model.
     * 
     * @param  {Number}  id  [optional] The value of the model's primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    delete(id = 0) {
        if (id == 0) {
            this.__resetWhere();
            if (this.__whereState.where) {
                var state = this.__whereState;
                this.__where += " and " + state.where;
                this.__bindings = this.__bindings.concat(state.bindings);
            }
            return super.delete().then(model => {
                if (model.affectedRows == 0) {
                    // If no model is affected, throw an error.
                    throw new Error("No " + this.constructor.name +
                        " was deleted by matching the given condition.");
                } else {
                    return model;
                }
            })
        } else {
            return this.get(id).then(model => {
                return model.delete();
            });
        }
    }

    /** Resets the where... clause */
    __resetWhere(resetState = false) {
        this.__where = "";
        this.__limit = "";
        this.__bindings = [];
        this.bindings = [];
        if (resetState) {
            this.__whereState.where = "";
            this.__whereState.bindings = [];
        }
        return this.where(this.__primary, this.__data[this.__primary]);
    }

    /**
     * Gets a model from the database.
     * 
     * @param  {Number}  id  [optional] The value of the model's primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the fetched model.
     */
    get(id = 0) {
        if (id == 0) {
            return super.get().then(data => {
                if (!data || Object.keys(data).length === 0) {
                    // If no model is retrieved, throw an error.
                    throw new Error("No " + this.constructor.name +
                        " was found by matching the given condition.");
                } else {
                    // Remove temporary property.
                    delete this.__caller;
                    delete this.__foreignKey;
                    delete this.__typeKey;
                    delete this.__pivot;
                    // Assign data and trigger event handlers.
                    this.assign(data);
                    this.__modified = {};
                    this.trigger("get", this);
                    return this;
                }
            });
        } else {
            return this.where(this.__primary, id).get();
        }
    }

    /**
     * Gets all models from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is all fetched models carried in an array.
     */
    all() {
        return super.all().then(data => {
            if (data.length === 0) {
                // If no models are retrieved, throw an error.
                throw new Error("No " + this.constructor.name +
                    " was found by matching the given condition.");
            } else {
                var models = [];
                for (let i in data) {
                    let model = new this.constructor();
                    // Assign data and trigger event handlers for every model.
                    model.use(this).assign(data[i]).trigger("get", model);
                    models.push(model);
                }
                return models;
            }
        });
    }

    /**
     * Gets multiple models that suit the given condition. Unlike 
     * `model.all()`, this method accepts other arguments in a simpler way to 
     * generate sophisticated SQL statement and fetch models with paginated 
     * information.
     * 
     * @param  {Object}  args  [optional] An object carries key-value pairs 
     *  information for fields, and it also accepts these properties:
     *  * `page` The current page, default is `1`.
     *  * `limit` The top limit of per page, default is `10`.
     *  * `orderBy` Ordered by a particular field, default is the primary key.
     *  * `sequence` The sequence of how the data are ordered, it could be 
     *      `asc`, `desc` or `rand`, default is `asc`.
     *  * `keywords` Keywords for vague searching, it could be a string or an 
     *      array.
     * 
     * @return {Promise} Returns a Promise, and the only argument passes to 
     *  the callback of `then()` is an object that carries some information of
     *  these:
     *  * `page` The current page.
     *  * `limit` The top limit of per page.
     *  * `orderBy` Ordered by a particular field.
     *  * `sequence` Sequence of how the data are ordered.
     *  * `keywords` Keywords for vague searching.
     *  * `pages` A number of all model pages.
     *  * `total` A number of all model counts.
     *  * `data` An array that carries all fetched models.
     */
    getMany(args = {}) {
        var defaults = {
            page: 1,
            limit: 10,
            orderBy: this.__primary,
            sequence: "asc",
            keywords: "",
        };
        args = Object.assign(defaults, args);

        // Set basic query conditions.
        var offset = (args.page - 1) * args.limit;
        this.limit(args.limit, offset);
        if (args.sequence !== "asc" && args.sequence != "desc")
            this.random();
        else
            this.orderBy(args.orderBy, args.sequence);

        // Set where clause for fields.
        for (let field of this.__fields) {
            if (args[field] && defaults[field] === undefined) {
                let operator = "=",
                    value = args[field],
                    match = value.match(/^(<>|!=|<=|>=|<|>|=)\w+/);
                if (match) { // Handle values which start with an operator.
                    operator = match[1];
                    value = value.substring(operator.length);
                }
                this.where(field, operator, value);
            }
        }

        // Set where clause by using keywords in a vague searching senario.
        if (args.keywords && this.__searchable) {
            var keywords = args.keywords,
                wildcard = this.__config.type == "access" ? "*" : "%";
            if (typeof keywords == "string") keywords = [keywords];
            for (let i in keywords) {
                // Escape special characters.
                keywords[i] = keywords[i].replace("\\", "\\\\")
                    .replace(wildcard, "\\" + wildcard);
            }
            // Construct nested conditions.
            this.where((query) => {
                for (let field of this.__searchable) {
                    query.orWhere((query) => {
                        for (let keyword of keywords) {
                            keyword = wildcard + keyword + wildcard;
                            query.orWhere(field, "like", keyword);
                        }
                    });
                }
            });
        }

        // Get paginated information.
        return this.paginate(args.page, args.limit).then(info => {
            return Object.assign(args, info);
        });
    }

    /**
     * Sets an extra where... clause for the SQL statement when updating or 
     * deleting the model.
     * 
     * @param  {String|Function|Object}  field  This could be a field name, or
     *  an object that sets multiple `=` (equal) conditions for the clause. Or
     *  pass a callback function to generate nested conditions, the only 
     *  argument passed to the callback is a new Query instance with its 
     *  features.
     * 
     * @param  {String|Function}  operator  [optional] Condition operator, if 
     *  the `value` isn't passed, then this argument will replace it, and the 
     *  operator will become an `=`. It is also possible to pass this argument
     *  a callback function to generate a child-SQL statement, the only 
     *  argument passed to the callback is a new Query instance, so that you
     *  can use its features to generate a SQL statement.
     * 
     * @param  {String|Number}  value  [optional] A value that needs to be 
     *  compared with `field`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    whereState(field, operator = null, value = undefined) {
        var query = new Query();
        query.where(field, operator, value);
        this.__whereState.where = query.__where;
        this.__whereState.bindings = query.__bindings;
        return this;
    }

    /*************************** Static Wrappers ****************************/

    /**
     * Uses a DB instance and share its connection to the database. If use 
     * this method, call it right after creating the instance.
     * 
     * @param  {DB}  db  A DB instance that is already created.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static use(db) {
        return (new this()).use(db);
    }

    /**
     * Starts a transaction and handle actions in it.
     * 
     * @param  {Function}  callback  If a function is passed, the code in it 
     *  will be automatically handled, that means if the program goes well, 
     *  the transaction will be automatically committed, otherwise it will be 
     *  automatically rolled back. If no function is passed, it just start the
     *  transaction, that means you have to commit and roll back manually.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    static transaction(callback = null) {
        return (new this()).transaction(callback);
    }

    /**
     * Sets what fields that need to be fetched.
     * 
     * @param  {String|Array}  fields  A list of all target fields, each one 
     *  passed as an argument, or just pass the first argument as an array 
     *  that carries all the field names.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static select(...fields) {
        return (new this()).select(fields);
    }

    /**
     * Sets a inner join... clause for the SQL statement.
     * 
     * @param  {String}  table  A table name that needs to join with.
     * 
     * @param  {String}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {String}  operator  Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {String}  field2  [optional] A field in `table` that needs to
     *  be compared with `field1`. If this argument is missing, then 
     *  `operator` will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static join(table, field1, operator, field2) {
        return (new this()).join(table, field1, operator, field2);
    }

    /**
     * Sets a left join... clause for the SQL statement.
     * 
     * @param  {String}  table  A table name that needs to join with.
     * 
     * @param  {String}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {String}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {String}  field2  [optional] A field in `table` that needs to
     *  be compared with `field1`. If this argument is missing, then 
     *  `operator` will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static leftJoin(table, field1, operator, field2) {
        return (new this()).leftJoin(table, field1, operator, field2);
    }

    /**
     * Sets a right join... clause for the SQL statement.
     * 
     * @param  {String}  table  A table name that needs to join with.
     * 
     * @param  {String}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {String}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {String}  field2  [optional] A field in `table` that needs to
     *  be compared with `field1`. If this argument is missing, then 
     *  `operator` will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static rightJoin(table, field1, operator, field2) {
        return (new this()).rightJoin(table, field1, operator, field2);
    }

    /**
     * Sets a full join... clause for the SQL statement.
     * 
     * @param  {String}  table  A table name that needs to join with.
     * 
     * @param  {String}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {String}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {String}  field2  [optional] A field in `table` that needs to
     *  be compared with `field1`. If this argument is missing, then 
     *  `operator` will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static fullJoin(table, field1, operator, field2) {
        return (new this()).fullJoin(table, field1, operator, field2);
    }

    /**
     * Sets a cross join... clause for the SQL statement.
     * 
     * @param  {String}  table  A table name that needs to join with.
     * 
     * @param  {String}  field1  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {String}  operator Condition operator, if the `field2` isn't 
     *  passed, then this argument will replace it, and the operator will 
     *  become an `=`.
     * 
     * @param  {String}  field2  [optional] A field in `table` that needs to
     *  be compared with `field1`. If this argument is missing, then 
     *  `operator` will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static crossJoin(table, field1, operator, field2) {
        return (new this()).crossJoin(table, field1, operator, field2);
    }

    /**
     * Sets a where... clause for the SQL statement.
     * 
     * @param  {String|Function|Object}  field  This could be a field name, or
     *  an object that sets multiple `=` (equal) conditions for the clause. Or
     *  pass a callback function to generate nested conditions, the only 
     *  argument passed to the callback is a new Query instance with its 
     *  features.
     * 
     * @param  {String|Function}  operator  [optional] Condition operator, if 
     *  the `value` isn't passed, then this argument will replace it, and the 
     *  operator will become an `=`. It is also possible to pass this argument
     *  a callback function to generate a child-SQL statement, the only 
     *  argument passed to the callback is a new Query instance, so that you
     *  can use its features to generate a SQL statement.
     * 
     * @param  {String|Number}  value  [optional] A value that needs to be 
     *  compared with `field`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static where(field, operator = null, value = undefined) {
        return (new this()).where(field, operator, value);
    }

    /**
     * Sets a where...between... clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Array}  range  An array that carries only two elements which
     *  represent the start point and the end point.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereBetween(field, range) {
        return (new this()).whereBetween(field, range);
    }

    /**
     * Sets a where...not between clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Array}  range  An array that carries only two elements which
     *  represent the start point and the end point.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNotBetween(field, range) {
        return (new this()).whereNotBetween(field, range);
    }

    /**
     * Sets a where...in... clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Function|Array}  values  An array that carries all possible 
     *  values. Or pass a callback function to generate child-SQL statement, 
     *  the only argument passed to the callback is a new Query instance, so 
     *  that you can use its features to generate a SQL statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereIn(field, values) {
        return (new this()).whereIn(field, values);
    }

    /**
     * Sets a where...not in... clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently 
     *  binds to.
     * 
     * @param  {Function|Array}  values  An array that carries all possible 
     *  values. Or pass a callback function to generate child-SQL statement, 
     *  the only argument passed to the callback is a new Query instance, so 
     *  that you can use its features to generate a SQL statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNotIn(field, values) {
        return (new this()).whereNotIn(field, values);
    }

    /**
     * Sets a where...is null clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently binds
     *  to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNull(field) {
        return (new this()).whereNull(field);
    }

    /**
     * Sets a where...is not null clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently binds
     *  to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNotNull(field) {
        return (new this()).whereNotNull(field);
    }

    /**
     * Sets a where exists... clause for the SQL statement.
     * 
     * @param  {Function}  callback  Pass a callback function to generate 
     *  child-SQL statement, the only argument passed to the callback is a new
     *  Query instance, so that you can use its features to generate a SQL 
     *  statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereExists(callback) {
        return (new this()).whereExists(callback);
    }

    /**
     * Sets a where not exists... clause for the SQL statement.
     * 
     * @param  {Function}  callback  Pass a callback function to generate 
     *  child-SQL statement, the only argument passed to the callback is a new
     *  Query instance, so that you can use its features to generate a SQL 
     *  statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNotExists(callback) {
        return (new this()).whereNotExists(callback);
    }

    /**
     * Sets an order by... clause for the SQL statement.
     * 
     * @param  {String}  field  A field name in the table that currently binds
     *  to.
     * 
     * @param  {String}  sequence  [optional] The way of how records ordered, 
     *  it could be either `asc` or `desc`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static orderBy(field, sequence = "") {
        return (new this()).orderBy(field, sequence);
    }

    /**
     * Sets that the records will be ordered in random sequence.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static random() {
        return (new this()).random();
    }

    /**
     * Sets a group by... clause for the SQL statement.
     * 
     * @param  {String|Array}  fields  A list of all target fields, each one 
     *  passed as an argument. Or just pass the first argument as an array 
     *  that carries all the field names.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static groupBy(...fields) {
        return (new this()).groupBy(fields);
    }

    /**
     * Sets a having... clause for the SQL statement.
     * 
     * @param  {String}  raw  A SQL clause for defining comparing conditions.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static having(raw) {
        return (new this()).having(raw);
    }

    /**
     * Sets a limit... clause for the SQL statement.
     * 
     * @param  {Number}  length  The top limit of how many counts that this 
     *  query will fetch.
     * 
     * @param  {Number}  offset  [optional] The start point, count from `0`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static limit(length, offset = 0) {
        return (new this()).limit(length, offset);
    }

    /**
     * Inserts a new record into the database.
     * 
     * @param  {Object}  data  An object that carries fields and their values,
     *  or pass all values in an array that fulfil all the fields.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    static insert(data) {
        return (new this(data)).insert();
    }

    /**
     * Deletes a model with a specified id.
     * 
     * @param  {Number}  id  [optional] The value of the model's primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the current instance.
     */
    static delete(id) {
        return (new this()).delete(id);
    }

    /**
     * Gets a model from the database.
     * 
     * @param  {Number}  id  [optional] The value of the model's primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the fetched model.
     */
    static get(id) {
        return (new this()).get(id);
    }

    /**
     * Gets all records from the database.
     * 
     * @return  {Promise}  Returns a Promise, and the the only argument passed
     *  to the callback of `then()` is all the fetched data  carried in an 
     *  array.
     */
    static all() {
        return (new this()).all();
    }

    /**
     * Gets all counts of records or a specified filed.
     * 
     * @param  {String}  field  [optional] Count a specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is a number that represents the count of 
     *  records.
     */
    static count(field = "*") {
        return (new this()).count(field);
    }

    /**
     * Gets the maximum value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the maximum value fetched.
     */
    static max(field) {
        return (new this()).max(field);
    }

    /**
     * Gets the minimum value of a specified field in the table.
     * 
     * @param  {String}  field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the minimum value fetched.
     */
    static min(field) {
        return (new this()).min(field);
    }

    /**
     * Gets the average value of a specified field in the table.
     * 
     * @param  {String}  field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the average value fetched.
     */
    static avg(field) {
        return (new this()).avg(field);
    }

    /**
     * Gets the summarized value of a specified field in the table.
     * 
     * @param  {String}  field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the summarized value fetched.
     */
    static sum(field) {
        return (new this()).sum(field);
    }

    /**
     * Processes chunked data with a specified length.
     * 
     * @param  {Number}  length  The top limit of how many records that each 
     *  chunk will carry.
     * 
     * @param  {Function}  callback  A function for processing every chunked 
     *  data, the only argument passed to it is the data that current chunk 
     *  carries. If the callback returns `false`, stop chunking.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to
     *  the callback of `then()` is the last chunk of data.
     */
    static chunk(length, callback) {
        return (new this()).chunk(length, callback);
    }

    /**
     * Gets paginated information of all records that suit given conditions.
     * 
     * @param  {Number}  page  [optional] The current page, default is `1`.
     * 
     * @param  {Number}  length  [optional] The top limit of per page, default
     *  is `10`. Also you can call `query.limit()` to specify a length before 
     *  calling this method.
     * 
     * @return {Promise} Returns a Promise, the only argument passes to the 
     *  callback of `then()` is an object that carries the information, it 
     *  includes:
     *  * `page` The current page.
     *  * `limit` The top limit of per page.
     *  * `pages` A number of all record pages.
     *  * `total` A number of all record counts.
     *  * `data` An array that carries all fetched data.
     */
    static paginate(page = 1, limit = 10) {
        return (new this()).paginate(page, limit);
    }

    /**
     * Gets multiple models that suit the given condition. Unlike 
     * `model.all()`, this method accepts other arguments in a simpler way to 
     * generate sophisticated SQL statement and fetch models with paginated 
     * information.
     * 
     * @param  {Object}  args  [optional] An object carries key-value pairs 
     *  information for fields, and it also accepts these properties:
     *  * `page` The current page, default is `1`.
     *  * `limit` The top limit of per page, default is `10`.
     *  * `orderBy` Ordered by a particular field, default is the primary key.
     *  * `sequence` The sequence of how the data are ordered, it could be 
     *      `asc`, `desc` or `rand`, default is `asc`.
     *  * `keywords` Keywords for vague searching, it could be a string or an 
     *      array.
     * 
     * @return {Promise} Returns a Promise, and the only argument passes to 
     *  the callback of `then()` is an object that carries some information of
     *  these:
     *  * `page` The current page.
     *  * `limit` The top limit of per page.
     *  * `orderBy` Ordered by a particular field.
     *  * `sequence` Sequence of how the data are ordered.
     *  * `keywords` Keywords for vague searching.
     *  * `pages` A number of all model pages.
     *  * `total` A number of all model counts.
     *  * `data` An array that carries all fetched models.
     */
    static getMany(args = {}) {
        return (new this()).getMany(args);
    }

    /**
     * Sets an extra where... clause for the SQL statement when updating or 
     * deleting the model.
     * 
     * @param  {String|Function|Object}  field  This could be a field name, or
     *  an object that sets multiple `=` (equal) conditions for the clause. Or
     *  pass a callback function to generate nested conditions, the only 
     *  argument passed to the callback is a new Query instance with its 
     *  features.
     * 
     * @param  {String|Function}  operator  [optional] Condition operator, if 
     *  the `value` isn't passed, then this argument will replace it, and the 
     *  operator will become an `=`. It is also possible to pass this argument
     *  a callback function to generate a child-SQL statement, the only 
     *  argument passed to the callback is a new Query instance, so that you
     *  can use its features to generate a SQL statement.
     * 
     * @param  {String|Number}  value  [optional] A value that needs to be 
     *  compared with `field`. If this argument is missing, then `operator` 
     *  will replace it, and the operator will become an `=`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    static whereState(field, operator = null, value = undefined) {
        return (new this()).whereState(field, operator, value);
    }

    /**************************** Associations *****************************/

    /**
     * Defines a has (many) association.
     * 
     * @param  {Model}  Model  A model class that needs to be associated.
     * 
     * @param  {String}  foreignKey  A foreign key in the associated model.
     * 
     * @param  {String}  typeKey  [optional] A field name in the associated 
     *  model that stores the current model name when you are defining a 
     *  polymorphic association.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *  its features to handle data.
     */
    has(Model, foreignKey, typeKey = "") {
        var model = Model.use(this)
            .where(foreignKey, this.__data[this.__primary]);
        if (typeKey) {
            model.where(typeKey, this.constructor.name);
        }
        return model;
    }

    /**
     * Defines a belongs-to association.
     * 
     * @param  {Model}  Model  A model class that needs to be associated.
     * 
     * @param  {String}  foreignKey  A foreign key in the current model.
     * 
     * @param  {String}  typeKey  [optional] A field name in the current model
     *  that stores the current model name when you are defining a polymorphic
     *  association.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *  its features to handle data.
     */
    belongsTo(Model, foreignKey, typeKey = "") {
        var model = (new Model).use(this);
        model.__caller = this;
        model.__foreignKey = foreignKey;
        model.__typeKey = typeKey;
        if (typeKey) {
            if (Model.name != this.__data[typeKey]) {
                return model.where(model.__primary, null);
            }
        }
        return model.where(model.__primary, this.__data[foreignKey]);
    }

    /**
     * Defines a has (many) association through a middle model.
     * 
     * @param  {Model}  Model  A model class that needs to be associated.
     * 
     * @param  {Model}  MiddleModel  The class of the middle model.
     * 
     * @param  {String}  foreignKey1  A foreign key in the associated model 
     *  that points to the middle model.
     * 
     * @param  {String}  foreignKey2  A foreign key in the middle model that 
     *  points to the current model.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *  its features to handle data.
     */
    hasThrough(Model, MiddleModel, foreignKey1, foreignKey2) {
        var model = new Model,
            _model = new MiddleModel;
        return model.use(this).whereIn(foreignKey1, query => {
            query.select(_model.__primary).from(_model.__table)
                .where(foreignKey2, this.__data[this.__primary]);
        });
    }

    /**
     * Defines a belongs-to association through a middle model.
     * 
     * @param  {Model}  Model  A model class that needs to be associated.
     * 
     * @param  {Model}  MiddleModel  The class of the middle model.
     * 
     * @param  {String}  foreignKey1  A foreign key in the current model that 
     *  points to the middle model.
     * 
     * @param  {String} foreignKey2 A foreign key in the middle model that 
     *  points to the associated model.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *  its features to handle data.
     */
    belongsToThrough(Model, MiddleModel, foreignKey1, foreignKey2) {
        var model = new Model,
            _model = new MiddleModel;
        return model.use(this).where(model.__primary, query => {
            query.select(foreignKey2).from(_model.__table)
                .where(_model.__primary, this.__data[foreignKey1]);
        });
    }

    /**
     * Defines a has (many) association via a pivot table.
     * 
     * @param  {Model}  Model  A model class that needs to be associated.
     * 
     * @param  {String}  pivotTable  The name of the pivot table.
     * 
     * @param  {String}  foreignKey1  A foreign key in the pivot table that 
     *  points to the associated model.
     * 
     * @param  {String}  foreignKey2  A foreign key in the pivot table that 
     *  points to the current model.
     * 
     * @param  {String}  typeKey  [optional] A field name in the pivot table 
     *  that stores the current model name when you are defining a polymorphic
     *  association.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *  its features to handle data.
     */
    hasVia(Model, pivotTable, foreignKey1, foreignKey2, typeKey = "") {
        var model = new Model;
        model.__caller = this;
        model.__pivot = [
            pivotTable,
            foreignKey1,
            foreignKey2,
            typeKey,
            this.constructor.name
        ];
        return model.use(this).whereIn(model.__primary, query => {
            query.select(model.__pivot[1]).from(model.__pivot[0])
                .where(model.__pivot[2], this.__data[this.__primary]);
            if (model.__pivot[3]) {
                query.where(model.__pivot[3], model.__pivot[4]);
            }
        });
    }

    /**
     * Defines a belongs-to (many) association via a pivot table.
     * 
     * @param  {Model}  Model  A model class that needs to be associated.
     * 
     * @param  {String}  pivotTable  The name of the pivot table.
     * 
     * @param  {String}  foreignKey1  A foreign key in the pivot table that 
     *  points to the current model.
     * 
     * @param  {String}  foreignKey2  A foreign key in the pivot table that 
     *  points to the associated model.
     * 
     * @param  {String}  typeKey  [optional] A field name in the pivot table 
     *  that stores the associated model name when you are defining a 
     *  polymorphic association.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *  its features to handle data.
     */
    belongsToVia(Model, pivotTable, foreignKey1, foreignKey2, typeKey = "") {
        var model = new Model;
        model.__caller = this;
        model.__pivot = [
            pivotTable,
            foreignKey2,
            foreignKey1,
            typeKey,
            Model.name
        ];
        return model.use(this).whereIn(model.__primary, query => {
            query.select(model.__pivot[1]).from(model.__pivot[0])
                .where(model.__pivot[2], this.__data[this.__primary]);
            if (model.__pivot[3]) {
                query.where(model.__pivot[3], model.__pivot[4]);
            }
        });
    }

    /**
     * Makes an association to a specified model.
     * 
     * This method can only be called after calling `model.belongsTo()`.
     * 
     * @param  {Model}  model  A model that needs to be associated or a number
     *  that represents the value of the model's primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the caller instance.
     */
    associate(model) {
        if (!(this.__caller instanceof Model)) {
            throw new Error("model.associate() can only be called after " +
                "calling model.belongsTo().");
        }

        var target = this.__caller,
            id = null;
        if (!isNaN(model)) {
            id = model;
        } else if (model instanceof Model) {
            id = model.__data[model.__primary];
        } else {
            throw new Error("The only argument passed to model.associate() " +
                "must be a number or an instance of Model.");
        }
        target.__data[this.__foreignKey] = id;
        if (this.__typeKey)
            target.__data[this.__typeKey] = this.constructor.name;
        return target.save().then(target => {
            return target;
        });
    }

    /**
     * Removes the association bound by `model.associate()`.
     * 
     * This method can only be called after calling `model.belongsTo()`.
     * 
     * @param  {String}  foreignKey  A foreign key in the current model.
     * 
     * @param  {String}  typeKey  [optional] A field name that stores the 
     *  associated model name when you are defining a polymorphic association.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the caller instance.
     */
    dissociate() {
        if (!(this.__caller instanceof Model)) {
            throw new Error("model.dissociate() can only be called after " +
                "calling model.belongsTo().");
        }

        var target = this.__caller;
        target.__data[this.__foreignKey] = null;
        if (this.__typeKey)
            target.__data[this.__typeKey] = null;
        return target.save().then(target => {
            return target;
        });
    }

    /**
     * Updates associations in a pivot table.
     * 
     * This method can only be called after calling `model.hasVia()` or 
     * `model.belongsToVia()`.
     * 
     * @param {Array|Object} models An array carries all models or numbers 
     *  which represents the values of models' primary keys that needs to be 
     *  associated. Also, it is possible to pass this argument an object that 
     *  its keys represents the values of models' primary keys, and its values
     *  sets extra data in the pivot table.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the caller instance.
     */
    attach(models) {
        var notArray = !(models instanceof Array);
        if (notArray && !(models instanceof Object)) {
            throw new Error("The only argument passed to model.attach() " +
                "must be an instance of Array or an instance of Object.");
        }
        if (!(this.__caller instanceof Model)) {
            throw new Error("model.attach() can only be called after " +
                "calling model.hasVia() or model.belongsToVia().");
        }

        var target = this.__caller,
            id1 = target.__data[target.__primary],
            ids = [];
        if (notArray) {
            for (let i in models) {
                if (models.hasOwnProperty(i) && !isNaN(i)) {
                    ids.push(parseInt(i));
                }
            }
        } else {
            for (let model of models) {
                if (!isNaN(model)) {
                    ids.push(model);
                } else if (model instanceof Model) {
                    ids.push(model.__data[model.__primary]);
                }
            }
        }

        var query = new Query(this.__pivot[0]);
        query.use(this).where(this.__pivot[2], id1);
        if (this.__pivot[3])
            query.where(this.__pivot[3], this.__pivot[4]);
        return query.all().then(data => {
            let exists = [],
                deletes = [],
                inserts = [],
                updates = [],
                _data = {};
            for (let single of data) {
                let id = single[this.__pivot[1]];
                exists.push(id);
                // Store records in an object.
                _data[id] = single;
                if (!ids.includes(id)) {
                    // Get IDs that needs to be deleted.
                    deletes.push(id);
                }
            }
            for (let id of ids) {
                if (!exists.includes(id)) {
                    // Get IDs that needs to be inserted.
                    inserts.push(id);
                } else if (notArray) {
                    // Get IDs that needs to be updated.
                    for (let i in models[id]) {
                        if (_data[id][i] !== undefined &&
                            _data[id][i] != models[id][i]) {
                            updates.push(id);
                            break;
                        }
                    }
                }
            }

            let _query = (new Query(this.__pivot[0])).use(this),
                // Insert association records within a recursive loop.
                doInsert = (query) => {
                    let id = inserts.shift(),
                        data = notArray ? models[id] : {};
                    data[this.__pivot[2]] = id1;
                    data[this.__pivot[1]] = id;
                    if (this.__pivot[3])
                        data[this.__pivot[3]] = this.__pivot[4];
                    // Insert a new record.
                    return query.insert(data).then(query => {
                        return inserts.length ? doInsert(query) : query;
                    });
                },
                // Update association records within a recursive loop.
                doUpdate = (query) => {
                    let id = updates.shift(),
                        data = notArray ? models[id] : {};

                    // Re-initiate the query.
                    query.__where = "";
                    query.__bindings = [];
                    query.where(
                        this.__pivot[1], _data[id][this.__pivot[1]]);
                    query.where(this.__pivot[2], id1);
                    delete data[this.__pivot[2]];
                    delete data[this.__pivot[1]];
                    if (this.__pivot[3]) {
                        query.where(this.__pivot[3], this.__pivot[4]);
                        delete data[this.__pivot[3]];
                    }
                    // Update the record.
                    return query.update(data).then(query => {
                        return updates.length ? doUpdate(query) : query;
                    });
                };
            if (deletes.length || updates.length || inserts.length) {
                // Handle the procedure in a transaction.
                return this.transaction(() => {
                    if (deletes.length) {
                        // Delete association records which are not in the 
                        // provided models.
                        _query.whereIn(this.__pivot[1], deletes);
                        _query.where(this.__pivot[2], id1);
                        if (this.__pivot[3])
                            _query.where(this.__pivot[3], this.__pivot[4]);
                        return _query.delete().then(_query => {
                            return updates.length ? doUpdate(_query) : _query;
                        }).then(_query => {
                            return inserts.length ? doInsert(_query) : _query;
                        }).then(_query => {
                            return target;
                        });
                    } else if (updates.length) {
                        return doUpdate(_query).then(_query => {
                            return inserts.length ? doInsert(_query) : _query;
                        }).then(_query => {
                            return target;
                        });
                    } else if (inserts.length) {
                        return doInsert(_query).then(_query => {
                            return target;
                        });
                    }
                });
            } else {
                return target;
            }
        });
    }

    /**
     * Deletes associations in a pivot table. 
     * 
     * This method can only be called after calling `model.hasVia()` or 
     * `model.belongsToVia()`.
     * 
     * @param {Array} models [optional] An array carries all models or numbers
     *  which represents the values of models' primary  keys that needs to be 
     *  associated. If this parameter is not provided, all associations of 
     *  the caller model in the pivot table will be deleted.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *  to the callback of `then()` is the caller instance.
     */
    detach(models = []) {
        if (!(models instanceof Array)) {
            throw new Error("The only argument passed to model.detach() " +
                "must be an instance of Array.");
        }
        if (!(this.__caller instanceof Model)) {
            throw new Error("model.attach() can only be called after " +
                "calling model.hasVia() or model.belongsToVia().");
        }

        var target = this.__caller,
            id1 = target.__data[target.__primary],
            query = new Query(this.__pivot[0]);
        query.use(this).where(this.__pivot[2], id1);
        if (this.__pivot[3])
            query.where(this.__pivot[3], this.__pivot[4]);
        if (models.length > 0) {
            // Delete association records which are in the provided models.
            let ids = [];
            for (let model of models) {
                if (!isNaN(model)) {
                    ids.push(model);
                } else if (model instanceof Model) {
                    ids.push(model.__data[model.__primary]);
                }
            }
            if (ids.length)
                query.whereIn(this.__pivot[1], ids);
        }
        return query.delete().then(query => target);
    }

    /**
     * Gets extra data from the pivot table.
     * 
     * This method can only be called after calling `model.hasVia()` or 
     * `model.belongsToVia()`.
     * 
     * @param  {String|Array}  fields  A list of all target fields, each one 
     *  passed as an argument, or just pass the first argument as an array 
     *  that carries all the field names.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    withPivot(...fields) {
        var caller = this.__caller,
            pivotTable = this.__pivot[0],
            foreignKey1 = pivotTable + "." + this.__pivot[1],
            foreignKey2 = pivotTable + "." + this.__pivot[2],
            primary = this.__table + "." + this.__primary;
        if (fields[0] instanceof Array)
            fields = fields[0];
        fields = fields.map(field => pivotTable + "." + field);
        fields.unshift(this.__table + ".*");
        this.select(fields)
            .join(pivotTable, foreignKey1, primary)
            .where(foreignKey2, caller.__data[caller.__primary]);
        return this;
    }

    /**
     * Gets the data that the model represents.
     * 
     * @return {Object} The model data in an object.
     */
    valueOf() {
        var data = {};
        for (let key of this.__fields) {
            let get = this.__lookupGetter__(key);
            if (get instanceof Function) {
                // Calling getter.
                let value = get.call(this, this.__data[key]);
                // Set this property only if getter returns an non-undefined
                // value.
                if (value !== undefined)
                    data[key] = value;
            } else if (this.__data[key] !== undefined) {
                data[key] = this.__data[key];
            }
        }
        return data;
    }

    /**
     * Gets the data string in a JSON that the model holds.
     * 
     * @return {String} A JSON string that represents the model data.
     */
    toString() {
        return JSON.stringify(this);
    }

    /**
     * Implements toJSON API.
     */
    toJSON() {
        return this.valueOf();
    }

    /**
     * Implements Iterator API.
     */
    [Symbol.iterator]() {
        var data = this.valueOf(),
            keys = Object.keys(data),
            length = keys.length,
            index = -1;
        return {
            next: () => {
                index++;
                if (index < length) {
                    return {
                        value: [keys[index], data[keys[index]]],
                        done: false,
                    };
                } else {
                    return { value: undefined, done: true };
                }
            }
        }
    }
}

module.exports = Model;