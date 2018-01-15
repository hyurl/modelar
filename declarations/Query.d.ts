import { DB } from "./DB";
/**
 * *Query Builder and beyond.*
 *
 * This class provides a bunch of methods with Object-Oriented features to
 * generate SQL statements and handle data in a more easier and efficient way.
 */
export declare class Query extends DB {
    /** The table that this query binds to. */
    protected _table: string;
    protected _inserts: string;
    protected _updates: string;
    protected _selects: string;
    protected _distinct: string;
    protected _join: string;
    protected _where: string;
    protected _orderBy: string;
    protected _groupBy: string;
    protected _having: string;
    protected _limit: string;
    protected _union: string;
    protected _bindings: any[];
    /** Creates a new Query instance with a specified table name. */
    constructor(table?: string);
    /**
     * Sets what fields that need to be fetched.
     * @param fields A list of all target fields.
     */
    select(fields: string[]): this;
    /**
     * Sets what fields that need to be fetched.
     * @param fields A list of all target fields.
     */
    select(...fields: string[]): this;
    /**
     * Sets the table name that the current instance binds to.
     * @param name The table name.
     */
    table(name: string): this;
    /** An alias of `query.table()` */
    from(table: string): this;
    /**
     * Sets a inner join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    join(table: string, field1: string, field2: string): this;
    /**
     * Sets a inner join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param operator Condition operator.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    join(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a left join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    leftJoin(table: string, field1: string, field2: string): this;
    /**
     * Sets a left join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param operator Condition operator.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    leftJoin(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a right join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    rightJoin(table: string, field1: string, field2: string): this;
    /**
     * Sets a right join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param operator Condition operator.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    rightJoin(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a full join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    fullJoin(table: string, field1: string, field2: string): this;
    /**
     * Sets a full join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param operator Condition operator.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    fullJoin(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a cross join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    crossJoin(table: string, field1: string, field2: string): this;
    /**
     * Sets a cross join... clause for the SQL statement.
     * @param table A table name that needs to be joined with.
     * @param field1 A field name in the table that currently binds to.
     * @param operator Condition operator.
     * @param field2 A field in `table` that needs to be compared with
     *  `field1`.
     */
    crossJoin(table: string, field1: string, operator: string, field2: string): this;
    protected _handleJoin(table: string, field1: string, operator: string, field2: string, type?: string): this;
    /** Sets a where... clause for the SQL statement. */
    where(field: string, value: string | number | boolean | Date): this;
    /** Sets a where... clause for the SQL statement with an operator. */
    where(field: string, operator: string, value: string | number | boolean | Date): this;
    /**  Sets a where... clause for the SQL statement with multiple fields. */
    where(fields: {
        [field: string]: string | number | boolean | Date;
    }): this;
    /**
     * Sets a where... clause for the SQL statement with a nested query.
     */
    where(nested: (query: Query) => void): this;
    /**
     * Sets a where... clause for the SQL statement with a nested query.
     */
    where(field: string, nested: (query: Query) => void): this;
    /**
     * Sets a where... clause for the SQL statement with a nested query.
     */
    where(field: string, operator: string, nested: (query: Query) => void): this;
    /** Sets a where...or... clause for the SQL statement. */
    orWhere(field: string, value: string | number | boolean | Date): this;
    /** Sets a where...or... clause for the SQL statement with an operator. */
    orWhere(field: string, operator: string, value: string | number | boolean | Date): this;
    /**
     * Sets a where...or... clause for the SQL statement with multiple fields.
     */
    orWhere(fields: {
        [field: string]: string | number | boolean | Date;
    }): this;
    /**
     * Sets a where...or... clause for the SQL statement with a nested
     * query.
     */
    orWhere(nested: (query: Query) => void): this;
    /**
     * Sets a where...or... clause for the SQL statement with a nested
     * query.
     */
    orWhere(field: string, nested: (query: Query) => void): this;
    /**
     * Sets a where...or... clause for the SQL statement with a nested
     * query.
     */
    orWhere(field: string, operator: string, nested: (query: Query) => void): this;
    private _handleWhere(field: string, operator: string, value?: string | number | boolean | Date): this;
    private _handleNestedWhere(cb: (query: Query) => void): this;
    private _handleWhereChild(field: string, cb: (query: Query) => void, operator?: string): this;
    private _getQueryBy(cb: (query: Query) => void): Query;
    /**
     * Sets a where...between... clause for the SQL statement.
     * @param range An array carries only two elements which represent the
     *  minimum and maximum number.
     */
    whereBetween(field: string, range: [number, number]): this;
    /**
     * Sets a where...not between... clause for the SQL statement.
     * @param range An array carries only two elements which represent the
     *  minimum and maximum number.
     */
    whereNotBetween(field: string, range: [number, number]): this;
    /**
     * Sets a where...or...between... clause for the SQL statement.
     * @param range An array carries only two elements which represent the
     *  minimum and maximum number.
     */
    orWhereBetween(field: string, range: [number, number]): this;
    /**
     * Sets a where...or...not between... clause for the SQL statement.
     * @param range An array carries only two elements which represent the
     *  minimum and maximum number.
     */
    orWhereNotBetween(field: string, range: [number, number]): this;
    private _handleBetween(field: string, range: [number, number], between?: boolean, conj?: string): this;
    /**
     * Sets a where...in... clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    whereIn(field: string, values: string[] | number[]): this;
    /**
     * Sets a where...in... clause for the SQL statement with a nested
     * query.
     */
    whereIn(field: string, nested: (query: Query) => void): this;
    /**
     * Sets a where...not in... clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    whereNotIn(field: string, values: string[] | number[]): this;
    /**
     * Sets a where...not in... clause for the SQL statement with a nested
     * query.
     */
    whereNotIn(field: string, nested: (query: Query) => void): this;
    /**
     * Sets a where...or...in... clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    orWhereIn(field: string, values: string[] | number[]): this;
    /**
     * Sets a where...or...in... clause for the SQL statement with a
     * nested query.
     */
    orWhereIn(field: string, nested: (query: Query) => void): this;
    /**
     * Sets a where...or...not in... clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    orWhereNotIn(field: string, values: string[] | number[]): this;
    /**
     * Sets a where...or...not in... clause for the SQL statement with a
     * nested query.
     */
    orWhereNotIn(field: string, nested: (query: Query) => void): this;
    private _handleIn(field: string, values: string[] | number[] | ((query: Query) => void), isIn?: boolean, conj?: string): this;
    private _handleInChild(field: string, cb: (query: Query) => void, isIn?: boolean): this;
    /** Sets a `where...is null` clause for the SQL statement. */
    whereNull(field: string): this;
    /** Sets a `where...is not null` clause for the SQL statement. */
    whereNotNull(field: string): this;
    /** Sets a `where...or...is null` clause for the SQL statement. */
    orWhereNull(field: string): this;
    /** Sets a `where...or...is not null` clause for the SQL statement. */
    orWhereNotNull(field: string): this;
    private _handleWhereNull(field: string, isNull?: boolean, conj?: string): this;
    /**
     * Sets a `where exists...` clause for the SQL statement with a nested
     * query.
     */
    whereExists(nested: (query: Query) => void): this;
    /**
     * Sets a `where not exists...` clause for the SQL statement with a nested
     * query.
     */
    whereNotExists(nested: (query: Query) => void): this;
    /**
     * Sets a `where...or exists...` clause for the SQL statement with a
     * nested query.
     */
    orWhereExists(nested: (query: Query) => void): this;
    /**
     * Sets a `where...or not exists...` clause for the SQL statement with a
     * nested query.
     */
    orWhereNotExists(nested: (query: Query) => void): this;
    private _handleExists(nested: (query: Query) => void, exists?: boolean, conj?: string): this;
    /** Sets an `order by...` clause for the SQL statement. */
    orderBy(field: string, sequence?: "asc" | "desc"): this;
    /** Sets that records will be ordered in random sequence. */
    random(): this;
    /** Sets a `group by...` clause for the SQL statement. */
    groupBy(fields: string[]): this;
    /** Sets a `group by...` clause for the SQL statement. */
    groupBy(...fields: string[]): this;
    /** Sets a `having...` clause for the SQL statement. */
    having(raw: string): this;
    /** Sets a limit... clause for the SQL statement. */
    limit(length: number, offset?: number): this;
    /**
     * Sets a distinct condition to get unique results in a select statement.
     */
    distinct(): this;
    /**
     * Unites two SQL statements into one.
     * @param all Use `union all` to concatenate results.
     */
    union(query: string | Query, all?: boolean): this;
    /** Inserts a new record into the database. */
    insert(data: {
        [field: string]: any;
    }): Promise<this>;
    /** Updates an existing record. */
    update(data: {
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
    protected _handleUpdate(parts: string[], bindings: any[]): Promise<this>;
    /** Deletes an existing record. */
    delete(): Promise<this>;
    /** Gets a record from the database. */
    get(): Promise<{
        [field: string]: any;
    }>;
    /** Gets all records from the database. */
    all(): Promise<any[]>;
    /**
     * Gets all counts of records or a specified field.
     * @param field Count a specified field.
     */
    count(field?: string): Promise<number>;
    /** Gets the maximum value of a specified field in the table. */
    max(field: string): Promise<number>;
    /** Gets the minimum value of a specified field in the table. */
    min(field: string): Promise<number>;
    /** Gets the average value of a specified field in the table. */
    avg(field: string): Promise<number>;
    /** Gets the summarized value of a specified field in the table. */
    sum(field: string): Promise<number>;
    /**
     * Processes chunked data with a specified length.
     * @param length The top limit of how many records that each chunk will
     *  carry.
     * @param cb A function for processing every chunked data.
     */
    chunk(length: number, cb: (data: any[]) => false | void): Promise<any[]>;
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
        data: any[];
    }>;
    private _handleAggregate(name: string, field: string): Promise<number>;
    private _handleSelect(): Promise<any[] | {
        [field: string]: any;
    }>;
    /** Gets the select statement from the current instance. */
    getSelectSQL(): string;
}
