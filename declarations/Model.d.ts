import { DB } from "./DB";
import { Query } from "./Query";
import { ModelConfig, DBConfig } from "./interfaces";
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
 * for...of... loop, like `for(let [field, value] of model)`.
 */
export declare class Model extends Query {
    protected __lookupGetter__: Function;
    protected __lookupSetter__: Function;
    private _caller?: Model;
    private _foreignKey?: string;
    private _typeKey?: string;
    private _pivot?: string[];
    /** Fields in the model's table */
    protected _fields: string[];
    /** Searchable fields in the model's table. */
    protected _searchable: string[];
    /** Primary key of the model's table. */
    protected _primary: string;
    /** The true data of the model. */
    data: {
        [field: string]: any;
    };
    /** Deprecated, use `data` instead. */
    _data: {
        [field: string]: any;
    };
    /**
     * Extra data of the model.
     *
     * When calling `model.assign()`, those data which are not defined in the
     * `model._fields` will be stored in this property, and they won't be used
     * when inserting or updating the model.
     */
    extra: {
        [field: string]: any;
    };
    /** Deprecated, use `extra` instead. */
    _extra: {
        [field: string]: any;
    };
    /** The data that needs to be updated to the database. */
    protected _modified: {
        [field: string]: any;
    };
    /**
     * Sets an extra where... clause for the SQL statement when updating or
     * deleting the model.
     */
    private _whereState: {
        where: string;
        bindings: any[];
    };
    constructor();
    /** Creates a new instance with initial data */
    constructor(data: {
        [field: string]: any;
    });
    /**  Creates a new instance with initial data and model configurations. */
    constructor(data: {
        [field: string]: any;
    }, config: ModelConfig);
    /** Whether the current model is new. */
    readonly isNew: boolean;
    private _defineProperties(fields: string[]): void;
    /**
     * Assigns data to the model instance.
     * @param useSetter Use setters (if any) to process the data.
     */
    assign(data: {
        [field: string]: any;
    }, useSetter?: boolean): this;
    /**
     * Saves the current model, if there is no record in the database, it will
     * be automatically inserted.
     */
    save(): Promise<this>;
    /** Inserts the current model as a new record into the database. */
    insert(data?: {
        [field: string]: any;
    }): Promise<this>;
    /** Updates the current model. */
    update(data?: {
        [field: string]: any;
    }): Promise<this>;
    /** Increases a specified field with an optional step. */
    increase(field: string, step?: number): Promise<this>;
    /** Increases multiple fields at one time. */
    increase(fields: {
        [field: string]: number;
    }): Promise<this>;
    /** Decreases a specified field with an optional step. */
    decrease(field: string, step?: number): Promise<this>;
    /** Decreases multiple fields at one time. */
    decrease(fields: {
        [field: string]: number;
    }): Promise<this>;
    protected _handleCrease(field: string | object, step: number, type: "+" | "-"): Promise<this>;
    protected _resetWhere(resetState?: boolean): this;
    /** Deletes the current model. */
    delete(id?: number): Promise<this>;
    /** Gets a model from the database. */
    get(id?: number): Promise<this>;
    /** Gets all matched models from the database. */
    all(): Promise<this[]>;
    /**
     * Processes chunked data with a specified length.
     * @param length The top limit of how many records that each chunk will
     *  carry.
     * @param cb A function for processing every chunked data.
     */
    chunk(length: number, cb: (data: Model[]) => false | void): Promise<this[]>;
    /**
     * Gets paginated information of all records that suit given conditions.
     * @param page The current page.
     * @param length The top limit of how many records that each page will
     *  carry.
     */
    paginate(page: number, length?: number): Promise<{
        page: number;
        limit: number;
        pages: number;
        total: number;
        data: Model[];
    }>;
    /** Gets multiple models that suit the given condition. */
    getMany(options?: {
        /** Default `1`. */
        page?: number;
        /** Default `10` */
        limit?: number;
        /** Default `model._primary` */
        orderBy?: string;
        /** Default `asc`. */
        sequence?: "asc" | "desc" | "rand";
        /** Used for vague searching. */
        keywords?: string | string[];
    }): Promise<{
        page: number;
        pages: number;
        limit: number;
        total: number;
        orderBy: string;
        sequence: "asc" | "desc" | "rand";
        keywords: string | string[];
        data: Model[];
    }>;
    /**
     * Sets an extra `where...` clause for the SQL statement when updating or
     * deleting the model to mark the state.
     */
    whereState(field: string, value: string | number | boolean | Date): this;
    /**
     * Sets an extra `where...` clause for the SQL statement when updating or
     * deleting the model to mark the state.
     */
    whereState(field: string, operator: string, value: string | number | boolean | Date): this;
    /**
     * Sets an extra `where...` clause for the SQL statement when updating or
     * deleting the model to mark the state.
     */
    whereState(fields: {
        [field: string]: string | number | boolean | Date;
    }): this;
    /** Gets the data that the model represents. */
    valueOf(): {
        [field: string]: any;
    };
    /** Gets the data string in a JSON that the model holds. */
    toString(formatted?: boolean): string;
    toJSON(): {
        [field: string]: any;
    };
    [Symbol.iterator](): {
        next: () => {
            value: [string, any];
            done: boolean;
        };
    };
    static use(db: DB): Model;
    static transaction(): Promise<Model>;
    static transaction(cb: (model: Model) => Promise<any>): Promise<Model>;
    static select(fields: string[]): Model;
    static select(...fields: string[]): Model;
    static join(table: string, field1: string, field2: string): Model;
    static join(table: string, field1: string, operator: string, field2: string): Model;
    static leftJoin(table: string, field1: string, field2: string): Model;
    static leftJoin(table: string, field1: string, operator: string, field2: string): Model;
    static rightJoin(table: string, field1: string, field2: string): Model;
    static rightJoin(table: string, field1: string, operator: string, field2: string): Model;
    static fullJoin(table: string, field1: string, field2: string): Model;
    static fullJoin(table: string, field1: string, operator: string, field2: string): Model;
    static crossJoin(table: string, field1: string, field2: string): Model;
    static crossJoin(table: string, field1: string, operator: string, field2: string): Model;
    static where(field: string, value: string | number | boolean | Date): Model;
    static where(field: string, operator: string, value: string | number | boolean | Date): Model;
    static where(fields: {
        [field: string]: string | number | boolean | Date;
    }): Model;
    static where(nested: (query: Query) => void): Model;
    static where(field: string, nested: (query: Query) => void): Model;
    static where(field: string, operator: string, nested: (query: Query) => void): Model;
    static whereBetween(field: string, range: [number, number]): Model;
    static whereNotBetween(field: string, range: [number, number]): Model;
    static whereIn(field: string, values: string[] | number[]): Model;
    static whereIn(field: string, nested: (query: Query) => void): Model;
    static whereNull(field: string): Model;
    static whereNotNull(field: string): Model;
    static whereExists(nested: (query: Query) => void): Model;
    static whereNotExists(nested: (query: Query) => void): Model;
    static orderBy(field: string, sequence?: "asc" | "desc"): Model;
    static random(): Model;
    static groupBy(fields: string[]): Model;
    static groupBy(...fields: string[]): Model;
    static having(raw: string): Model;
    static limit(length: number, offset?: number): Model;
    static distinct(): Model;
    static insert(data: {
        [field: string]: any;
    }): Promise<Model>;
    static delete(id: number): Promise<Model>;
    static get(id: number): Promise<Model>;
    static all(): Promise<Model[]>;
    static count(field?: string): Promise<number>;
    static max(field: string): Promise<number>;
    static min(field: string): Promise<number>;
    static avg(field: string): Promise<number>;
    static sum(field: string): Promise<number>;
    static chunk(length: number, cb: (data: Model[]) => false | void): Promise<Model[]>;
    static paginate(page: number, length?: number): Promise<{
        page: number;
        limit: number;
        pages: number;
        total: number;
        data: Model[];
    }>;
    static getMany(options?: {
        page?: number;
        limit?: number;
        orderBy?: string;
        sequence?: "asc" | "desc" | "rand";
        keywords?: string | string[];
    }): Promise<{
        page: number;
        pages: number;
        limit: number;
        total: number;
        orderBy: string;
        sequence: "asc" | "desc" | "rand";
        keywords: string | string[];
        data: Model[];
    }>;
    static whereState(field: string, value: string | number | boolean | Date): Model;
    static whereState(field: string, operator: string, value: string | number | boolean | Date): Model;
    static whereState(fields: {
        [field: string]: string | number | boolean | Date;
    }): Model;
    static whereState(nested: (query: Query) => void): Model;
    static whereState(field: string, nested: (query: Query) => void): Model;
    static whereState(field: string, operator: string, nested: (query: Query) => void): Model;
    /**
     * Defines a `has (many)` association.
     * @param foreignKey A foreign key in the associated model.
     */
    protected has(ModelClass: typeof Model, foreignKey: string): Model;
    /**
     * Defines a polymorphic `has (many)` association.
     * @param foreignKey A foreign key in the associated model.
     * @param typeKey A field name in the associated model that stores the
     *  current model name.
     */
    protected has(ModelClass: typeof Model, foreignKey: string, typeKey: string): Model;
    /**
     * Defines a `belongs-to` association.
     * @param foreignKey A foreign key in the current model.
     */
    protected belongsTo(ModelClass: typeof Model, foreignKey: string): Model;
    /**
     * Defines a polymorphic `belongs-to` association.
     * @param foreignKey A foreign key in the current model.
     * @param typeKey A field name in the current model that stores the
     *  associated model name.
     */
    protected belongsTo(ModelClass: typeof Model, foreignKey: string, typeKey: string): Model;
    /**
     * Defines a `has (many)` association through a middle model.
     * @param MiddleModel The class of the middle model.
     * @param foreignKey1 A foreign key in the associated model that points
     *  to the middle model.
     * @param foreignKey2 A foreign key in the middle model that points to the
     *  current model.
     */
    protected hasThrough(ModelClass: typeof Model, MiddleModel: typeof Model, foreignKey1: string, foreignKey2: string): Model;
    /**
     * Defines a `belongs-to` association through a middle model.
     * @param MiddleModel The class of the middle model.
     * @param foreignKey1 A foreign key in the current model that points to
     *  the middle model.
     * @param foreignKey2 A foreign key in the middle model that points to the
     *  associated model.
     */
    protected belongsToThrough(ModelClass: typeof Model, MiddleModel: typeof Model, foreignKey1: string, foreignKey2: string): Model;
    /**
     * Defines a `has` association via a pivot table.
     * @param pivotTable The name of the pivot table.
     * @param foreignKey1 A foreign key in the pivot table that points to the
     *  associated model.
     * @param foreignKey2 A foreign key in the pivot table that points to the
     *  current model.
     */
    protected hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string): Model;
    /**
     * Defines a polymorphic `has many` association via a pivot table.
     * @param pivotTable The name of the pivot table.
     * @param foreignKey1 A foreign key in the pivot table that points to the
     *  associated model.
     * @param foreignKey2 A foreign key in the pivot table that points to the
     *  current model.
     * @param typeKey A field name in the pivot table that stores the current
     *  model name.
     */
    protected hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, typeKey: string): Model;
    /**
     * Defines a `belongs-to` association via a pivot table.
     * @param pivotTable  The name of the pivot table.
     * @param foreignKey1 A foreign key in the pivot table that points to the
     *  current model.
     * @param foreignKey2 A foreign key in the pivot table that points to the
     *  associated model.
     */
    protected belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string): Model;
    /**
     * Defines a polymorphic `belongs-to many` association via a pivot table.
     * @param pivotTable  The name of the pivot table.
     * @param foreignKey1 A foreign key in the pivot table that points to the
     *  current model.
     * @param foreignKey2 A foreign key in the pivot table that points to the
     *  associated model.
     * @param typeKey  A field name in the pivot table that stores the
     *  associated model name.
     */
    protected belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, typeKey: string): Model;
    /** Gets extra data from the pivot table. */
    withPivot(fields: string[]): this;
    /** Gets extra data from the pivot table. */
    withPivot(...fields: string[]): this;
    /**
     * Makes an association to a specified model.
     *
     * This method can only be called after calling `model.belongsTo()`.
     *
     * @param id The value of associative model's primary key.
     */
    associate(id: number): Promise<Model>;
    /**
     * Makes an association to a specified model.
     *
     * This method can only be called after calling `model.belongsTo()`.
     *
     * @param model Associative model instance.
     */
    associate(model: Model): Promise<Model>;
    /**
     * Removes the association bound by `model.associate()`.
     *
     * This method can only be called after calling `model.belongsTo()`.
     */
    dissociate(): Promise<Model>;
    /**
     * Updates associations in a pivot table.
     *
     * This method can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     *
     * @param ids Values of associative models' primary keys.
     */
    attach(ids: number[]): Promise<Model>;
    /**
     * Updates associations in a pivot table.
     *
     * This method can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     *
     * @param models Associative model instances.
     */
    attach(models: Model[]): Promise<Model>;
    /**
     * Updates associations in a pivot table with additional fields.
     *
     * This method can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     *
     * @param pairs The keys represents the values of associative models'
     *  primary keys, and values sets extra fields in the pivot table.
     */
    attach(pairs: {
        [id: number]: {
            [field: string]: any;
        };
    }): Promise<Model>;
    /**
     * Deletes associations in a pivot table.
     *
     * This method can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     *
     * @param ids Values of associative models' primary keys.
     */
    detach(ids?: number[]): Promise<Model>;
    /**
     * Deletes associations in a pivot table.
     *
     * This method can only be called after calling `model.hasVia()` or
     * `model.belongsToVia()`.
     *
     * @param models Associative model instances.
     */
    detach(models?: Model[]): Promise<Model>;
}
