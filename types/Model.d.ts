import { DB } from "./DB";
import { Query } from "./Query";
import { ModelConfig, DBConfig, PaginatedModels, ModelGetManyOptions, FieldConfig } from "./interfaces";
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
export declare class Model extends Query {
    /**
     * Uses old style iterator when put the model in a `for...of...` loop,
     * remember, old style is **deprecated**, a warning will be logged out.
     */
    static oldIterator: boolean;
    /** Primary key of the table. */
    primary: string;
    /** Fields in the table */
    fields: string[];
    /** Searchable fields in the table. */
    searchable: string[];
    /** The schema of the table. */
    schema: {
        [field: string]: FieldConfig;
    };
    /** The true data of the model. */
    data: {
        [field: string]: any;
    };
    /**
     * Extra data of the model.
     *
     * When calling `model.assign()`, those data which are not defined in the
     * `model.fields` will be stored in this property, and they won't be used
     * when inserting or updating the model.
     */
    readonly extra: {
        [field: string]: any;
    };
    /**
     * Creates a new model with optional initial data.
     */
    constructor(data?: {
        [field: string]: any;
    }, config?: ModelConfig);
    /** Whether the current model is new. */
    readonly isNew: boolean;
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
    chunk(length: number, cb: (models: this[]) => false | void): Promise<this[]>;
    /**
     * Gets paginated information of all records that suit given conditions.
     * @param page The current page.
     * @param length The top limit of how many records that each page will
     *  carry.
     */
    paginate(page: number, length?: number): Promise<PaginatedModels>;
    /** Gets multiple models that suit the given condition. */
    getMany(options?: ModelGetManyOptions): Promise<PaginatedModels>;
    /**
     * Sets an extra `where...` clause for the SQL statement when updating or
     * deleting the model to mark the state.
     *
     * Unlike `query.where()` or other alike methods, this method can be
     * called only once.
     */
    whereState(field: string, value: any): this;
    whereState(field: string, operator: string, value: any): this;
    whereState(fields: {
        [field: string]: any;
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
    [Symbol.iterator](): IterableIterator<{
        key: string;
        value: any;
    }>;
    /** Create database table according to the class definition. */
    createTable(): Promise<this>;
    static set(config: DBConfig): Model;
    static set(name: string, value: any): Model;
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
    static where(field: string, value: any): Model;
    static where(field: string, operator: string, value: any): Model;
    static where(fields: {
        [field: string]: any;
    }): Model;
    static where(nested: (query: Query) => void): Model;
    static where(field: string, nested: (query: Query) => void): Model;
    static where(field: string, operator: string, nested: (query: Query) => void): Model;
    static whereBetween(field: string, [min, max]: [number, number]): Model;
    static whereNotBetween(field: string, [min, max]: [number, number]): Model;
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
    static paginate(page: number, length?: number): Promise<PaginatedModels>;
    static getMany(options?: ModelGetManyOptions): Promise<PaginatedModels>;
    static whereState(field: string, value: any): Model;
    static whereState(field: string, operator: string, value: any): Model;
    static whereState(fields: {
        [field: string]: any;
    }): Model;
    static createTable(): Promise<Model>;
    /**
     * Defines a `has (many)` association.
     * @param foreignKey A foreign key in the associated model.
     */
    protected has(ModelClass: typeof Model, foreignKey: string): Model;
    /**
     * Defines a polymorphic `has (many)` association.
     * @param foreignKey A foreign key in the associated model.
     * @param type A field name in the associated model that stores the
     *  current model name.
     */
    protected has(ModelClass: typeof Model, foreignKey: string, type: string): Model;
    /**
     * Defines a `belongs-to` association.
     * @param foreignKey A foreign key in the current model.
     */
    protected belongsTo(ModelClass: typeof Model, foreignKey: string): Model;
    /**
     * Defines a polymorphic `belongs-to` association.
     * @param foreignKey A foreign key in the current model.
     * @param type A field name in the current model that stores the
     *  associated model name.
     */
    protected belongsTo(ModelClass: typeof Model, foreignKey: string, type: string): Model;
    /**
     * Defines a `has (many)` association through a middle model.
     * @param MiddleClass The class of the middle model.
     * @param foreignKey1 A foreign key in the associated model that points
     *  to the middle model.
     * @param foreignKey2 A foreign key in the middle model that points to the
     *  current model.
     */
    protected hasThrough(ModelClass: typeof Model, MiddleClass: typeof Model, foreignKey1: string, foreignKey2: string): Model;
    /**
     * Defines a `belongs-to` association through a middle model.
     * @param MiddleClass The class of the middle model.
     * @param foreignKey1 A foreign key in the current model that points to
     *  the middle model.
     * @param foreignKey2 A foreign key in the middle model that points to the
     *  associated model.
     */
    protected belongsToThrough(ModelClass: typeof Model, MiddleClass: typeof Model, foreignKey1: string, foreignKey2: string): Model;
    /**
     * Defines a `has many` association via a pivot table.
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
     * @param type A field name in the pivot table that stores the current
     *  model name.
     */
    protected hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, type: string): Model;
    /**
     * Defines a `belongs-to many` association via a pivot table.
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
     * @param type A field name in the pivot table that stores the
     *  associated model name.
     */
    protected belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, type: string): Model;
    /** Gets extra data from the pivot table. */
    withPivot(fields: string[]): this;
    /** Gets extra data from the pivot table. */
    withPivot(...fields: string[]): this;
    /**
     * Makes an association to a specified model.
     *
     * This method can only be called after calling `model.belongsTo()`.
     *
     * @param id The value of associative primary key.
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
