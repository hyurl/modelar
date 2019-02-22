import { DB } from "./DB";
import { Query } from "./Query";
import {
    ModelConfig,
    DBConfig,
    PaginatedModels,
    ModelGetManyOptions,
    FieldConfig,
    PaginatedRecords
} from "./interfaces";
import { Table } from "./Table";
import { UpdateError, DeletionError, NotFoundError } from "./Errors";
import assign = require("lodash/assign");
const inspect: string | symbol = require("util").inspect.custom || "inspect";

/**
 * *Model Wrapper and beyond.*
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
 * for...of... loop, like `for(let { key, value } of model)`.
 */
export class Model extends Query {
    /** @private */
    private _proto: this;
    /** @private */
    private _caller: Model;
    /** @private */
    private _foreignKey: string;
    /** @private */
    private _type: string;
    /** @private */
    private _pivot: string[];

    /**
     * @private
     * Sets an extra `where...` clause for the SQL statement when updating or 
     * deleting the model.
     */
    private _whereState = { where: "", bindings: [] };

    /** Primary key of the table. */
    primary: string;

    /** @private Fields in the table */
    private _fields: string[];

    /**
     * Searchable fields in the table.
     * 
     * These fields are used when calling `model.getMany()` and set `keywords`
     * for fuzzy query.
     */
    searchable: string[];

    /** The schema of the table. */
    schema: { [field: string]: FieldConfig };

    /** The real data of the model. */
    data: { [field: string]: any } = {};

    /** @property The initial data provided to the constructor. */
    private _initData: this["data"];

    /** @private The data that needs to be updated to the database. */
    private _modified: { [field: string]: any } = {};

    /**
     * Extra data of the model.
     * 
     * When calling `model.assign()`, those data which are not defined in the 
     * `model.fields` will be stored in this property, and they won't be used
     * when inserting or updating the model.
     * 
     * @readonly
     */
    readonly extra: { [field: string]: any } = {};

    /**
     * If `false`, then failed calling `model.get()` and `model.all()` will 
     * not throw a `NotFoundError`, just return `null` on `get()` and `[]` on 
     * `all()`. Default is `true`.
     */
    throwNotFoundError = true;

    /** 
     * Creates a new model with optional initial data.
     */
    constructor(data?: { [field: string]: any }, config?: ModelConfig) {
        super(config && config.table || "");

        config = config || ModelConfig;

        this._proto = Object.getPrototypeOf(this);
        this._initData = data;
        this.primary = config.primary || this._protoProp("primary") || "";
        this.fields = config.fields || this._protoProp("_fields") || [];
        this.searchable = config.searchable || this._protoProp("searchable") || [];
        this.schema = this._protoProp("schema") || {};
    }

    /** Fields in the table. */
    get fields(): string[] {
        return this._fields;
    }

    set fields(names: string[]) {
        this._fields = names;

        // define pseudo-properties
        if (!this._protoProp("_initiated") && names && names.length)
            this._defineProperties(names);

        // assign data
        if (this._initData && names && names.length) {
            delete this._initData[this.primary]; // filter primary key
            this.assign(this._initData, true);
        }
    }

    /** Whether the current model is new. */
    get isNew(): boolean {
        return this.data[this.primary] == undefined;
    }

    get isModel(): boolean {
        return true;
    }

    /** @private */
    private _protoProp(name: string): any {
        return this._proto.hasOwnProperty(name) ? this._proto[name] : undefined;
    }

    /** @private */
    private _defineProperties(fields: string[]): void {
        let props: { [prop: string]: PropertyDescriptor } = {};

        for (let field of fields) {
            if (!(field in this)) { // Define new setter/getter.
                props[field] = {
                    get() {
                        return this.data[field];
                    },
                    set(v) {
                        // Primary key is read-only.
                        if (field != this.primary) {
                            this.data[field] = v;
                            if (!this.isNew)
                                this._modified[field] = v;
                        }
                    }
                }
            } else {
                let desc = Object.getOwnPropertyDescriptor(this._proto, field);
                if (desc && desc.set) { // Rewrite the setter.
                    let oringin = desc.set;
                    desc.set = function set(v) {
                        oringin.call(this, v);
                        if (!this.isNew)
                            this._modified[field] = this.data[field];
                    }
                    props[field] = desc;
                }
            }
        }

        Object.defineProperties(this._proto, props);
        this._proto["_initiated"] = true;
    }

    /**
     * Assigns data to the model instance.
     * @param useSetter Use setters (if any) to process the data.
     */
    assign(data: { [field: string]: any }, useSetter = false): this {
        if (this.data instanceof Array) {
            // `data` extends from DB class, so it could be an array.
            this.data = {};
        }

        for (let key in data) {
            if (this.fields.indexOf(key) >= 0) {
                // Only accept those fields that `fields` sets.
                if (useSetter) {
                    let desc = Object.getOwnPropertyDescriptor(this._proto, key);
                    if (desc && desc.set instanceof Function) {
                        desc.set.call(this, data[key]); // Calling setter
                    } else {
                        this.data[key] = data[key];
                    }
                } else {
                    this.data[key] = data[key];
                }

                if (!this.isNew && key != this.primary) {
                    this._modified[key] = this.data[key];
                }
            } else {
                this.extra[key] = data[key];
            }
        }

        return this;
    }

    /** 
     * Saves the current model, if there is no record in the database, it will
     * be automatically inserted.
     */
    save(): Promise<this> {
        this.emit("save", this); // Emit the save event.
        let exists = this.data[this.primary],
            promise = exists ? this.update() : this.insert();

        return promise.then(model => {
            this.emit("saved", model);
            return this;
        });
    }

    /** Inserts the current model as a new record into the database. */
    insert(data?: { [field: string]: any }): Promise<this> {
        if (data)
            this.assign(data, true);

        return super.insert(this.data).then(model => {
            model.where(model.primary, model.insertId);
            let sql = model.sql,
                bindings = model.bindings;

            // Get final data from the database.
            return model.get().then(() => {
                model.sql = sql;
                model.bindings = bindings;
                return model;
            });
        });
    }

    /** Updates the current model. */
    update(data?: { [field: string]: any }): Promise<this> {
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }

        if (data) {
            delete data[this.primary];
            this.assign(data, true);
        }

        data = assign({}, this._modified);

        if (Object.keys(data).length === 0) {
            // If no data modified, resolve the current model immediately.
            return new Promise(resolve => {
                resolve(this);
            });
        } else {
            return super.update(data).then(model => {
                if (model.affectedRows == 0) {
                    // If no model is affected, throw an error.
                    throw new UpdateError("No " + this.constructor["name"]
                        + " was updated by the given condition.");
                } else {
                    let sql = model.sql,
                        bindings = model.bindings;

                    model._resetWhere(true);

                    // Get final data from the database.
                    return model.get().then(() => {
                        model.sql = sql;
                        model.bindings = bindings;
                        return model;
                    });
                }
            });
        }
    }

    /** Increases a specified field with an optional step. */
    increase(field: string, step?: number): Promise<this>;
    /** Increases multiple fields at one time. */
    increase(fields: { [field: string]: number }): Promise<this>;
    increase(field: string | object, step = 1) {
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return this._handleCrease2(field, step, "+");
    }

    /** Decreases a specified field with an optional step. */
    decrease(field: string, step?: number): Promise<this>;
    /** Decreases multiple fields at one time. */
    decrease(fields: { [field: string]: number }): Promise<this>;
    decrease(field: string | object, step = 1) {
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return this._handleCrease2(field, step, "-");
    }

    /** @private */
    private _handleCrease2(
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

        delete data[this.primary];

        for (let field in data) {
            if (this.fields.indexOf(field) >= 0 && data[field] > 0) {
                bindings.push(data[field]);
                field = this.backquote(field);
                parts.push(`${field} = ${field} ${type} ?`);
            }
        }

        return this["_handleUpdate"](parts, bindings).then(model => {
            if (model.affectedRows == 0) {
                // If no model is affected, throw an error.
                throw new UpdateError("No " + this.constructor["name"]
                    + " was updated by the given condition.");
            } else {
                let sql = model.sql,
                    bindings = model.bindings;

                model._resetWhere(true);

                // Get final data from the database.
                return model.get().then(() => {
                    model.sql = sql;
                    model.bindings = bindings;
                    return model;
                });
            }
        });
    }

    /** @private */
    private _resetWhere(resetState = false): this {
        this["_where"] = "";
        this["_limit"] = 0;
        this["_bindings"] = [];
        this.bindings = [];
        if (resetState) {
            this._whereState.where = "";
            this._whereState.bindings = [];
        }
        this.where(this.primary, this.data[this.primary]);
        return this;
    }

    /** Deletes the current model. */
    delete(id?: number): Promise<this> {
        if (id) {
            return this.get(id).then(model => {
                return model.delete();
            });
        }

        if (!this["_where"]) {
            throw new Error("No where condition is set to delete models.");
        }

        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }

        return super.delete().then(model => {
            if (model.affectedRows == 0) {
                // If no model is affected, throw an error.
                throw new DeletionError("No " + this.constructor["name"]
                    + " was deleted by the given condition.");
            } else {
                return model;
            }
        });
    }

    /** Gets a model from the database. */
    get(id?: number): Promise<this> {
        if (id) {
            return this.where(this.primary, id).get();
        }

        if (!this["_where"]) {
            throw new Error("No where condition is set to fetch models.");
        }

        return super.get().then(data => {
            if (!data || Object.keys(data).length === 0) {
                if (this.throwNotFoundError) {
                    // If no model is retrieved, throw an error.
                    throw new NotFoundError("No " + this.constructor["name"]
                        + " was found by the given condition.");
                } else {
                    return null;
                }
            } else {
                // Remove temporary property.
                delete this._caller;
                delete this._foreignKey;
                delete this._type;
                delete this._pivot;

                // Assign data and emit event listeners.
                this.assign(data);
                this._modified = {};
                this.emit("get", this);

                return this;
            }
        });
    }

    /** Gets all matched models from the database. */
    all(): Promise<this[]> {
        return super.all().then(data => {
            if (data.length === 0) {
                if (this.throwNotFoundError) {
                    // If no models are retrieved, throw an error.
                    throw new NotFoundError("No " + this.constructor["name"]
                        + " was found by the given condition.");
                } else {
                    return data;
                }
            } else {
                let models: Model[] = [],
                    ModelClass = <typeof Model>this.constructor;

                for (let i in data) {
                    let model: Model;

                    if (ModelClass === Model) {
                        model = new ModelClass(null, {
                            table: this.table,
                            primary: this.primary,
                            fields: this.fields,
                            searchable: this.searchable
                        });
                    } else {
                        model = new ModelClass;
                    }

                    // Assign data and emit event listeners for every model.
                    model.use(this).assign(data[i]).emit("get", model);
                    models.push(model);
                }

                return <this[]>models;
            }
        });
    }

    /**
     * Processes chunked data with a specified length.
     * @param length The top limit of how many records that each chunk will 
     *  carry.
     * @param cb A function for processing every chunked data.
     */
    chunk(
        length: number,
        cb: (this: this, models: this[]) => false | void
    ): Promise<this[]> {
        return super.chunk(length, cb);
    }

    /**
     * Gets paginated information of all records that suit given conditions.
     * @param page The current page.
     * @param length The top limit of how many records that each page will
     *  carry.
     */
    paginate(page: number, length?: number): Promise<PaginatedRecords<this>> {
        return super.paginate(page, length);
    }

    /** Gets multiple models that suit the given condition. */
    getMany(options?: ModelGetManyOptions): Promise<PaginatedModels<this>> {
        let defaults = assign({}, ModelGetManyOptions, {
            orderBy: this.primary
        });

        options = assign(defaults, options);

        if (options.sequence !== "asc" && options.sequence != "desc")
            this.random();
        else
            this.orderBy(options.orderBy, options.sequence);

        // Set where clause for fields.
        for (let field of this.fields) {
            if (options[field] && defaults[field] === undefined) {
                let operator = "=",
                    value = options[field];
                if (typeof value === "string") {
                    let match = value.match(/^(<>|!=|<=|>=|<|>|=)\w+/);
                    if (match) { // Handle values which start with an operator.
                        operator = match[1];
                        value = value.substring(operator.length);
                    }
                }
                this.where(field, operator, value);
            }
        }

        // Set where clause by using keywords in a vague searching scenario.
        if (options.keywords && this.searchable) {
            let keywords = options.keywords,
                wildcard = this.config.type == "access" ? "*" : "%",
                wildcardRegExp = new RegExp("\\" + wildcard, "g");

            if (typeof keywords == "string")
                keywords = [keywords];

            for (let i in keywords) {
                // Escape special characters.
                keywords[i] = keywords[i].replace(/\\/g, "\\\\")
                    .replace(wildcardRegExp, "\\" + wildcard);
            }

            // Construct nested conditions.
            this.where((query) => {
                for (let field of this.searchable) {
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
        return this.paginate(options.page, options.limit).then(info => {
            Object.defineProperties(info, {
                orderBy: { value: options.orderBy },
                sequence: { value: options.sequence },
                keywords: { value: options.keywords }
            });
            return info;
            // return assign(info, options);
        });
    }

    /**
     * Sets an extra `where...` clause for the SQL statement when updating or
     * deleting the model to mark the state.
     *
     * Unlike `query.where()` or other alike methods, this method can be
     * called only once.
     */
    whereState(field: string, value: any): this;
    whereState(field: string, operator: string, value: any): this;
    whereState(fields: { [field: string]: any }): this;
    whereState(extra: (this: Query, query: Query) => void): this;
    whereState(...args) {
        let query = new Query().use(this);
        query.where.apply(query, args);
        this._whereState.where = query["_where"];
        this._whereState.bindings = query["_bindings"];
        return this;
    }

    /** Gets the data that the model represents. */
    valueOf(): { [field: string]: any } {
        let data = {};

        for (let key of this.fields) {
            let desc = Object.getOwnPropertyDescriptor(this._proto, key);
            if (desc && desc.get instanceof Function) {
                // Calling getter.
                let value = desc.get.call(this, this.data[key]);

                // Set this property only if getter returns an non-undefined
                // value.
                if (value !== undefined)
                    data[key] = value;
            } else if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }

        return data;
    }

    /** Gets the data string in a JSON that the model holds. */
    toString(formatted = false): string {
        if (formatted)
            return JSON.stringify(this, null, "  ");
        else
            return JSON.stringify(this);
    }

    toJSON(): { [field: string]: any } {
        return this.valueOf();
    }

    [Symbol.iterator](): IterableIterator<{ key: string, value: any }> {
        let data = this.valueOf();

        return (function* () {
            for (let key in data) {
                yield { key, value: data[key] };
            }
        })();
    }

    [inspect]() {
        let res = super[inspect]();

        // delete properties
        delete res["data"];
        delete res["searchable"];
        delete res["schema"];
        delete res["extra"];

        // re-assign properties
        res["fields"] = this.fields;
        res["searchable"] = this.searchable;
        res["schema"] = this.schema;
        res["data"] = this.data;
        res["extra"] = this.extra;

        for (const field of this.fields) {
            res[field] = this[field];
        }

        return res;
    }

    /** Create database table according to the class definition. */
    createTable(): Promise<this> {
        return new Table(this).save().then(() => this);
    }

    // Static Wrappers    

    static set<T extends Model>(config: DBConfig): T;
    static set<T extends Model>(name: string, value: any): T;
    static set(...args) {
        if (typeof args[0] === "string")
            return (new this).set(args[0], args[1]);
        else
            return (new this).set(args[0]);
    }

    static use<T extends Model>(db: DB) {
        return (new this).use(db) as T;
    }

    static transaction<T extends Model>(): Promise<T>;
    static transaction<T extends Model>(cb: (model: T) => any): Promise<T>;
    static transaction(cb?: (model: Model) => any) {
        return (new this).transaction(cb);
    }

    static select<T extends Model>(...fields: string[]): T;
    static select<T extends Model>(fields: string[]): T;
    static select() {
        return (new this).select(...Array.from(arguments));
    }

    static join<T extends Model>(
        table: string,
        field1: string,
        field2: string
    ): T;
    static join<T extends Model>(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): T;
    static join<T extends Model>(
        table: string,
        fields: { [field: string]: any; }
    ): T;
    static join<T extends Model>(
        table: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static join() {
        let model = new this;
        return model.join.apply(model, Array.from(arguments));
    }

    static leftJoin<T extends Model>(
        table: string,
        field1: string,
        field2: string
    ): T;
    static leftJoin<T extends Model>(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): T;
    static leftJoin<T extends Model>(
        table: string,
        fields: { [field: string]: any; }
    ): T;
    static leftJoin<T extends Model>(
        table: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static leftJoin() {
        let model = new this;
        return model.leftJoin.apply(model, Array.from(arguments));
    }

    static rightJoin<T extends Model>(
        table: string,
        field1: string,
        field2: string
    ): T;
    static rightJoin<T extends Model>(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): T;
    static rightJoin<T extends Model>(
        table: string,
        fields: { [field: string]: any; }
    ): T;
    static rightJoin<T extends Model>(
        table: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static rightJoin() {
        let model = new this;
        return model.rightJoin.apply(model, Array.from(arguments));
    }

    static fullJoin<T extends Model>(
        table: string,
        field1: string,
        field2: string
    ): T;
    static fullJoin<T extends Model>(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): T;
    static fullJoin<T extends Model>(
        table: string,
        fields: { [field: string]: any; }
    ): T;
    static fullJoin<T extends Model>(
        table: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static fullJoin() {
        let model = new this;
        return model.fullJoin.apply(model, Array.from(arguments));
    }

    static crossJoin<T extends Model>(
        table: string,
        field1: string,
        field2: string
    ): T;
    static crossJoin<T extends Model>(
        table: string,
        field1: string,
        operator: string,
        field2: string
    ): T;
    static crossJoin<T extends Model>(
        table: string,
        fields: { [field: string]: any; }
    ): T;
    static crossJoin<T extends Model>(
        table: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static crossJoin() {
        let model = new this;
        return model.fullJoin.apply(model, Array.from(arguments));
    }

    static where<T extends Model>(clause: DB.Statement): T;
    static where<T extends Model>(
        nested: (this: Query, query: Query) => void
    ): T;
    static where<T extends Model>(
        field: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static where<T extends Model>(field: string, value: any): T;
    static where<T extends Model>(
        field: string,
        operator: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static where<T extends Model>(
        field: string,
        operator: string,
        value: any
    ): T;
    static where<T extends Model>(fields: { [field: string]: any }): T;
    static where(field, operator = null, value = undefined) {
        return (new this).where(field, operator, value);
    }

    static whereBetween<T extends Model>(
        field: string,
        [min, max]: [number, number]
    ) {
        return (new this).whereBetween(field, [min, max]) as T;
    }

    static whereNotBetween<T extends Model>(
        field: string,
        [min, max]: [number, number]
    ) {
        return (new this).whereNotBetween(field, [min, max]) as T;
    }

    static whereIn<T extends Model>(
        field: string,
        values: string[] | number[]
    ): T;
    static whereIn<T extends Model>(
        field: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static whereIn(field, values) {
        return (new this).whereIn(field, values);
    }

    static whereNotIn<T extends Model>(
        field: string,
        values: string[] | number[]
    ): T;
    static whereNotIn<T extends Model>(
        field: string,
        nested: (this: Query, query: Query) => void
    ): T;
    static whereNotIn(field, values) {
        return (new this).whereNotIn(field, values);
    }

    static whereNull<T extends Model>(field: string) {
        return (new this).whereNull(field) as T;
    }

    static whereNotNull<T extends Model>(field: string) {
        return (new this).whereNotNull(field) as T;
    }

    static whereExists<T extends Model>(
        nested: (this: Query, query: Query) => void
    ) {
        return (new this).whereExists(nested) as T;
    }

    static whereNotExists<T extends Model>(
        nested: (this: Query, query: Query) => void
    ) {
        return (new this).whereNotExists(nested) as T;
    }

    static orderBy<T extends Model>(field: string, sequence?: "asc" | "desc") {
        return (new this).orderBy(field, sequence) as T;
    }

    static random<T extends Model>() {
        return (new this).random() as T;
    }

    static groupBy<T extends Model>(...fields: string[]): T;
    static groupBy<T extends Model>(fields: string[]): T;
    static groupBy() {
        return (new this).groupBy(...Array.from(arguments));
    }

    static having<T extends Model>(clause: string | DB.Statement) {
        return (new this).having(clause) as T;
    }

    static limit<T extends Model>(length: number, offset?: number) {
        return (new this).limit(length, offset) as T;
    }

    static distinct<T extends Model>() {
        return (new this).distinct() as T;
    }

    static insert<T extends Model>(data: { [field: string]: any }) {
        return (new this).insert(data) as Promise<T>;
    }

    static delete<T extends Model>(id: number) {
        return (new this).delete(id) as Promise<T>;
    }

    static get<T extends Model>(id: number) {
        return (new this).get(id) as Promise<T>;
    }

    static all<T extends Model>() {
        return (new this).all() as Promise<T[]>;
    }

    static count(field?: string): Promise<number> {
        return (new this).count(field);
    }

    static max(field: string): Promise<number> {
        return (new this).max(field);
    }

    static min(field: string): Promise<number> {
        return (new this).min(field);
    }

    static avg(field: string): Promise<number> {
        return (new this).avg(field);
    }

    static sum(field: string): Promise<number> {
        return (new this).sum(field);
    }

    static chunk<T extends Model>(
        length: number,
        cb: (this: T, models: T[]) => false | void
    ) {
        return (new this).chunk(length, cb) as Promise<T[]>;
    }

    static paginate<T extends Model>(page: number, length = 10) {
        return (new this).paginate(page, length) as Promise<PaginatedModels<T>>;
    }

    static getMany<T extends Model>(options?: ModelGetManyOptions) {
        return (new this).getMany(options) as Promise<PaginatedModels<T>>;
    }

    static whereState<T extends Model>(field: string, value: any): T;
    static whereState<T extends Model>(
        field: string,
        operator: string,
        value: any
    ): T;
    static whereState<T extends Model>(fields: { [field: string]: any }): T;
    static whereState<T extends Model>(
        extra: (this: Query, query: Query) => void
    ): T;
    static whereState() {
        let model = new this;
        return model.whereState.apply(model, Array.from(arguments));
    }

    static createTable<T extends Model>() {
        return (new this).createTable() as Promise<T>;
    }

    // Associations

    /**
     * @protected Defines a `has (many)` association.
     * @param foreignKey A foreign key in the associated model.
     * @param type A field in the associated model that stores the current model
     *  name, used to defines a polymorphic association.
     */
    protected has<T extends Model>(
        ModelClass: new (...args) => T,
        foreignKey: string,
        type?: string
    ): T {
        let model = (new ModelClass).use(this);
        model.where(foreignKey, this.data[this.primary]);
        if (type) {
            model.where(type, this.constructor["name"]);
        }
        return model;
    }

    /**
     * @protected Defines a `belongs-to` association.
     * @param foreignKey A foreign key in the current model.
     * @param type A field in the current model that stores the associated model
     *  name, used to define a polymorphic association.
     */
    protected belongsTo<T extends Model>(
        ModelClass: new (...args) => T,
        foreignKey: string,
        type?: string
    ): T {
        let model = (new ModelClass).use(this);
        model._caller = this;
        model._foreignKey = foreignKey;
        model._type = type;
        if (type && ModelClass["name"] != this.data[type]) {
            return model.where(model.primary, null);
        }
        return model.where(model.primary, this.data[foreignKey]);
    }

    /**
     * @protected Defines a `has (many)` association through a middle model.
     * @param MiddleClass The class of the middle model.
     * @param foreignKey1 A foreign key in the associated model that points 
     *  to the middle model.
     * @param foreignKey2 A foreign key in the middle model that points to the
     *  current model.
     */
    protected hasThrough<T extends Model, K extends Model>(
        ModelClass: new (...args) => T,
        MiddleClass: new (...args) => K,
        foreignKey1: string,
        foreignKey2: string
    ): T {
        let model = (new MiddleClass).use(this);
        return (new ModelClass).use(this).whereIn(foreignKey1, query => {
            query.select(model.primary).from(model.table)
                .where(foreignKey2, this.data[this.primary]);
        });
    }

    /**
     * @protected Defines a `belongs-to` association through a middle model.
     * @param MiddleClass The class of the middle model.
     * @param foreignKey1 A foreign key in the current model that points to 
     *  the middle model.
     * @param foreignKey2 A foreign key in the middle model that points to the
     *  associated model.
     */
    protected belongsToThrough<T extends Model, K extends Model>(
        ModelClass: new (...args) => T,
        MiddleClass: new (...args) => K,
        foreignKey1: string,
        foreignKey2: string
    ): T {
        let model = (new ModelClass).use(this),
            _model = (new MiddleClass).use(this);
        return model.where(model.primary, query => {
            query.select(foreignKey2).from(_model.table)
                .where(_model.primary, this.data[foreignKey1]);
        });
    }

    /**
     * @protected Defines a `has many` association via a pivot table.
     * @param pivotTable The name of the pivot table.
     * @param foreignKey1 A foreign key in the pivot table that points to the 
     *  associated model.
     * @param foreignKey2 A foreign key in the pivot table that points to the
     *  current model.
     * @param type A field in the pivot table that stores the current model 
     *  name, used to define a polymorphic association.
     */
    protected hasVia<T extends Model>(
        ModelClass: new (...args) => T,
        pivotTable: string,
        foreignKey1: string,
        foreignKey2: string,
        type?: string
    ): T {
        let model = (new ModelClass).use(this);
        model._caller = this;
        model._pivot = [
            pivotTable,
            foreignKey1,
            foreignKey2,
            type,
            this.constructor["name"]
        ];
        return this._handleVia(model);
    }

    /**
     * @protected Defines a `belongs-to many` association via a pivot table.
     * @param pivotTable  The name of the pivot table.
     * @param foreignKey1 A foreign key in the pivot table that points to the
     *  current model.
     * @param foreignKey2 A foreign key in the pivot table that points to the 
     *  associated model.
     * @param type A field in the pivot table that stores the associated model 
     *  name, used to define a polymorphic association.
     */
    protected belongsToVia<T extends Model>(
        ModelClass: new (...args) => T,
        pivotTable: string,
        foreignKey1: string,
        foreignKey2: string,
        type?: string
    ): T {
        let model = (new ModelClass).use(this);
        model._caller = this;
        model._pivot = [
            pivotTable,
            foreignKey2,
            foreignKey1,
            type,
            ModelClass["name"]
        ];
        return this._handleVia(model);
    }

    /** @private Handles `model.hasVia()` or `model.belongsToVia()`. */
    private _handleVia<T extends Model>(model: T, extra?: Query): T {
        return model.whereIn(model.primary, query => {
            query.select(model._pivot[1]).from(model._pivot[0])
                .where(model._pivot[2], this.data[this.primary]);

            if (model._pivot[3]) {
                query.where(model._pivot[3], model._pivot[4]);
            }

            if (extra) {
                query["_where"] += " and " + extra["_where"];
                query["_bindings"] = query["_bindings"].concat(extra["_bindings"]);
            }
        });
    }

    /**
     * Sets extra `where...` clause when fetching data via a pivot table.
     * 
     * Can only be called after calling `model.hasVia()` or 
     * `model.belongsToVia()`, and can be called only once.
     */
    wherePivot(field: string, value: any): this;
    wherePivot(field: string, operator: string, value: any): this;
    wherePivot(fields: { [field: string]: any }): this;
    wherePivot(extra: (this: Query, query: Query) => void): this;
    wherePivot() {
        if (!(this._caller instanceof Model)) {
            throw new ReferenceError("Model.withPivot() can only be called "
                + "after calling Model.hasVia() or Model.belongsToVia().");
        }

        let query = new Query().use(this);
        query.where.apply(query, Array.from(arguments));
        // reset where clause
        this["_where"] = "";
        this["_bindings"] = [];
        return this._caller._handleVia(this, query);
    }

    /**
     * Gets extra data from the pivot table.
     * 
     * Can only be called after calling `model.hasVia()`, 
     * `model.belongsToVia()`, or `model.wherePivot()`.
     */
    withPivot(...fields: string[]): this;
    withPivot(fields: string[]): this;
    withPivot(): this {
        if (!(this._caller instanceof Model)) {
            throw new ReferenceError("Model.withPivot() can only be called "
                + "after calling Model.hasVia(), Model.belongsToVia(), or "
                + "Model.wherePivot().");
        }

        let caller = this._caller,
            pivotTable = this._pivot[0],
            foreignKey1 = pivotTable + "." + this._pivot[1],
            foreignKey2 = pivotTable + "." + this._pivot[2],
            primary = this.table + "." + this.primary,
            fields: string[] = arguments[0] instanceof Array
                ? arguments[0]
                : Array.from(arguments);

        fields = fields.map(field => pivotTable + "." + field);
        fields.unshift(this.table + ".*");

        return this.select(fields)
            .join(pivotTable, foreignKey1, primary)
            .where(foreignKey2, caller.data[caller.primary]);
    }

    /**
     * Makes an association to a specified model.
     * 
     * Can only be called after calling `model.belongsTo()`.
     * 
     * @param model Associative model instance or its ID.
     */
    associate<T extends Model>(model: number | Model): Promise<T> {
        if (!(this._caller instanceof Model)) {
            throw new ReferenceError("Model.associate() can only be called "
                + "after calling Model.belongsTo().");
        }

        let target = this._caller,
            id: number = null;

        if (typeof model === "number") {
            id = model;
        } else if (model instanceof Model) {
            id = model.data[model.primary];
        } else {
            throw new TypeError("The only argument passed to "
                + "Model.associate() must be a number or an instance of "
                + "Model.");
        }

        target.data[this._foreignKey] = id;
        target._modified[this._foreignKey] = id;

        if (this._type) {
            target.data[this._type] = this.constructor["name"];
            target._modified[this._type] = this.constructor["name"];
        }

        return target.save() as Promise<T>;
    }

    /**
     * Removes the association bound by `model.associate()`.
     *
     * Can only be called after calling `model.belongsTo()`.
     */
    dissociate<T extends Model>(): Promise<T> {
        if (!(this._caller instanceof Model)) {
            throw new ReferenceError("Model.dissociate() can only be called "
                + "after calling Model.belongsTo().");
        }

        let target = this._caller;
        target.data[this._foreignKey] = null;
        target._modified[this._foreignKey] = null;

        if (this._type) {
            target.data[this._type] = null;
            target._modified[this._type] = null;
        }

        return target.save() as Promise<T>;
    }

    /**
     * Updates associations in a pivot table.
     *
     * Can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     * 
     * @param models Associative model instances or their IDs.
     */
    attach<T extends Model>(models: (number | Model)[]): Promise<T>;
    /**
     * @param pairs The keys represents the values of associative models' 
     *  primary keys, and values sets extra fields in the pivot table.
     */
    attach<T extends Model>(
        pairs: { [id: number]: { [field: string]: any } }
    ): Promise<T>;
    attach<T extends Model>(models): Promise<T> {
        let notArray = !(models instanceof Array);
        if (notArray && typeof models !== "object") {
            throw new TypeError("The only argument passed to Model.attach()"
                + " must be an array or an object.");
        }
        if (!(this._caller instanceof Model)) {
            throw new ReferenceError("Model.attach() can only be called after"
                + " calling Model.hasVia() or Model.belongsToVia().");
        }

        let target = this._caller,
            id1: number = target.data[target.primary],
            ids: number[] = [];

        if (notArray) {
            for (let i in models) {
                let id = parseInt(i);
                if (models.hasOwnProperty(i) && !isNaN(id)) {
                    ids.push(id);
                }
            }
        } else {
            for (let model of models) {
                if (typeof model === "number") {
                    ids.push(model);
                } else if (model instanceof Model) {
                    ids.push(model.data[model.primary]);
                }
            }
        }

        let query = new Query(this._pivot[0]).use(this);
        query.where(this._pivot[2], id1);

        if (this._pivot[3])
            query.where(this._pivot[3], this._pivot[4]);

        return query.all().then(data => {
            let exists: number[] = [],
                deletes: number[] = [],
                inserts: number[] = [],
                updates: number[] = [],
                _data: { [id: number]: any } = {};

            for (let single of data) {
                let id: number = single[this._pivot[1]];
                exists.push(id);

                // Store records in an object.
                _data[id] = single;

                if (ids.indexOf(id) === -1) {
                    // Get IDs that needs to be deleted.
                    deletes.push(id);
                }
            }

            for (let id of ids) {
                if (exists.indexOf(id) === -1) {
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

            let _query = new Query(this._pivot[0]).use(this);
            // Insert association records within a recursive loop.
            let doInsert: (query: Query) => Promise<Query> = (query: Query) => {
                let id = inserts.shift(),
                    data: {
                        [field: string]: any
                    } = notArray ? models[id] : {};

                data[this._pivot[2]] = id1;
                data[this._pivot[1]] = id;
                if (this._pivot[3])
                    data[this._pivot[3]] = this._pivot[4];

                // Insert a new record.
                return query.insert(data).then(query => {
                    return inserts.length ? doInsert(query) : query;
                });
            };

            // Update association records within a recursive loop.
            let doUpdate: (query: Query) => Promise<Query> = (query: Query) => {
                let id = updates.shift(),
                    data: {
                        [field: string]: any
                    } = notArray ? models[id] : {};

                // Re-initiate the query.
                query["_where"] = "";
                query["_bindings"] = [];
                query.where(this._pivot[1], _data[id][this._pivot[1]])
                    .where(this._pivot[2], id1);

                delete data[this._pivot[2]];
                delete data[this._pivot[1]];

                if (this._pivot[3]) {
                    query.where(this._pivot[3], this._pivot[4]);
                    delete data[this._pivot[3]];
                }

                // Update the record.
                return query.update(data).then(query => {
                    return updates.length ? doUpdate(query) : query;
                });
            };

            // Run the procedure.
            if (deletes.length || updates.length || inserts.length) {
                let promise: Promise<any>;

                if (deletes.length) {
                    // Delete association records which are not in the 
                    // provided models.
                    _query.whereIn(this._pivot[1], deletes)
                        .where(this._pivot[2], id1);

                    if (this._pivot[3])
                        _query.where(this._pivot[3], this._pivot[4]);

                    promise = _query.delete().then(_query => {
                        return updates.length ? doUpdate(_query) : _query;
                    }).then(_query => {
                        return inserts.length ? doInsert(_query) : _query;
                    });
                } else if (updates.length) {
                    promise = doUpdate(_query).then(_query => {
                        return inserts.length ? doInsert(_query) : _query;
                    });
                } else if (inserts.length) {
                    promise = doInsert(_query);
                }

                return promise.then(() => target);
            } else {
                return target;
            }
        }) as Promise<T>;
    }

    /**
     * Deletes associations in a pivot table.
     *
     * Can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     * 
     * @param models Associative model instances or their IDs.
     */
    detach<T extends Model>(models: (number | Model)[] = []): Promise<T> {
        if (!(models instanceof Array)) {
            throw new TypeError("The only argument passed to Model.detach()"
                + " must be an array.");
        }
        if (!(this._caller instanceof Model)) {
            throw new ReferenceError("Model.attach() can only be called after"
                + " calling Model.hasVia() or Model.belongsToVia().");
        }

        let target = this._caller,
            id1 = target.data[target.primary],
            query = new Query(this._pivot[0]).use(this);

        query.where(this._pivot[2], id1);

        if (this._pivot[3])
            query.where(this._pivot[3], this._pivot[4]);

        if (models.length > 0) {
            // Delete association records which are in the provided models.
            let ids = [];

            for (let model of models) {
                if (typeof model === "number") {
                    ids.push(model);
                } else if (model instanceof Model) {
                    ids.push(model.data[model.primary]);
                }
            }

            if (ids.length)
                query.whereIn(this._pivot[1], ids);
        }

        return query.delete().then(() => target) as Promise<T>;
    }
}

export interface Model {
    on(
        event: "query" | "save" | "saved" | "insert" | "inserted" | "update" | "updated" | "delete" | "deleted" | "get",
        listener: (thisObj: this) => void
    ): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

// Compatible for version 2.x.
Object.defineProperties(Model.prototype, {
    _extra: {
        get() {
            return this.extra;
        },
        set(v) {
            this.extra = v;
        }
    }
});