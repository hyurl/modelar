import { DB } from "./DB";
import { PaginatedRecords } from "./interfaces";
/**
 * *Query Builder and beyond.*
 *
 * This class provides a bunch of methods with Object-Oriented features to
 * generate SQL statements and handle data in a more easier and efficient way.
 */
export declare class Query extends DB {
    /** The table that this query binds to. */
    table: string;
    /** Creates a new Query instance with a specified table name. */
    constructor(table?: string);
    /**
     * Treats the given name as a field and keep its form in where or join
     * clause.
     */
    field(name: string): Query.Field;
    /** Sets what fields that need to be fetched. */
    select(fields: string[]): this;
    select(...fields: string[]): this;
    /** Sets the table name that the current instance binds to. */
    from(table: string): this;
    /** Sets multiple table names that the current instance binds to. */
    from(tables: string[]): this;
    from(...tables: string[]): this;
    /**
     * Sets a `inner join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    join(table: string, nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `inner join...` clause for the SQL statement with multiple
     * fields.
     */
    join(table: string, fields: {
        [field: string]: any;
    }): this;
    /** Sets a `inner join...` clause for the SQL statement. */
    join(table: string, field1: string, field2: string): this;
    join(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a `left join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    leftJoin(table: string, nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `left join...` clause for the SQL statement with multiple
     * fields.
     */
    leftJoin(table: string, fields: {
        [field: string]: any;
    }): this;
    /** Sets a `left join...` clause for the SQL statement. */
    leftJoin(table: string, field1: string, field2: string): this;
    leftJoin(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a `right join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    rightJoin(table: string, nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `right join...` clause for the SQL statement with multiple
     * fields.
     */
    rightJoin(table: string, fields: {
        [field: string]: any;
    }): this;
    /** Sets a `right join...` clause for the SQL statement. */
    rightJoin(table: string, field1: string, field2: string): this;
    rightJoin(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a `full join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    fullJoin(table: string, nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `full join...` clause for the SQL statement with multiple
     * fields.
     */
    fullJoin(table: string, fields: {
        [field: string]: any;
    }): this;
    /** Sets a `full join...` clause for the SQL statement. */
    fullJoin(table: string, field1: string, field2: string): this;
    fullJoin(table: string, field1: string, operator: string, field2: string): this;
    /**
     * Sets a `cross join...` clause for the SQL statement via a nested query,
     * in the nested query, use `where()` to set conditions for keyword `on`.
     */
    crossJoin(table: string, nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `cross join...` clause for the SQL statement with multiple
     * fields.
     */
    crossJoin(table: string, fields: {
        [field: string]: any;
    }): this;
    /** Sets a `cross join...` clause for the SQL statement. */
    crossJoin(table: string, field1: string, field2: string): this;
    crossJoin(table: string, field1: string, operator: string, field2: string): this;
    /** Sets a `where...` clause for the SQL statement with a nested query. */
    where(nested: (this: Query, query: Query) => void): this;
    where(field: string, nested: (this: Query, query: Query) => void): this;
    where(field: string, operator: string, nested: (this: Query, query: Query) => void): this;
    /** Sets a `where...` clause for the SQL statement with multiple fields. */
    where(fields: {
        [field: string]: any;
    }): this;
    /** Sets a `where...` clause for the SQL statement. */
    where(field: string, value: any): this;
    where(field: string, operator: string, value: any): this;
    /**
     * Sets a `where...or...` clause for the SQL statement with a nested
     * query.
     */
    orWhere(nested: (this: Query, query: Query) => void): this;
    orWhere(field: string, nested: (this: Query, query: Query) => void): this;
    orWhere(field: string, operator: string, nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `where...or...` clause for the SQL statement with multiple 
     * fields.
     */
    orWhere(fields: {
        [field: string]: any;
    }): this;
    /** Sets a `where...or...` clause for the SQL statement. */
    orWhere(field: string, value: any): this;
    orWhere(field: string, operator: string, value: any): this;
    /** Sets a `where...between...` clause for the SQL statement. */
    whereBetween(field: string, [min, max]: [number, number]): this;
    /** Sets a `where...not between...` clause for the SQL statement. */
    whereNotBetween(field: string, [min, max]: [number, number]): this;
    /** Sets a `where...or...between...` clause for the SQL statement. */
    orWhereBetween(field: string, [min, max]: [number, number]): this;
    /** Sets a `where...or...not between...` clause for the SQL statement. */
    orWhereNotBetween(field: string, [min, max]: [number, number]): this;
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
    /**
     * Sets a `where...or...not in...` clause for the SQL statement.
     * @param values An array carries all possible values.
     */
    orWhereNotIn(field: string, values: any[]): this;
    /**
     * Sets a `where...or...not in...` clause for the SQL statement with a
     * nested query.
     */
    orWhereNotIn(field: string, nested: (this: Query, query: Query) => void): this;
    /** Sets a `where...is null` clause for the SQL statement. */
    whereNull(field: string): this;
    /** Sets a `where...is not null` clause for the SQL statement. */
    whereNotNull(field: string): this;
    /** Sets a `where...or...is null` clause for the SQL statement. */
    orWhereNull(field: string): this;
    /** Sets a `where...or...is not null` clause for the SQL statement. */
    orWhereNotNull(field: string): this;
    /**
     * Sets a `where exists...` clause for the SQL statement with a nested
     * query.
     */
    whereExists(nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `where not exists...` clause for the SQL statement with a nested
     * query.
     */
    whereNotExists(nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `where...or exists...` clause for the SQL statement with a
     * nested query.
     */
    orWhereExists(nested: (this: Query, query: Query) => void): this;
    /**
     * Sets a `where...or not exists...` clause for the SQL statement with a
     * nested query.
     */
    orWhereNotExists(nested: (this: Query, query: Query) => void): this;
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
    /** Sets a `limit...` clause for the SQL statement. */
    limit(length: number, offset?: number): this;
    /**
     * Sets a `distinct` condition to get unique results in a select statement.
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
    } | any[]): Promise<this>;
    /** Updates an existing record. */
    update(data: {
        [field: string]: any;
    }): Promise<this>;
    /** Increases multiple fields at one time. */
    increase(fields: {
        [field: string]: number;
    }): Promise<this>;
    /** Increases a specified field with an optional step. */
    increase(field: string, step?: number): Promise<this>;
    /** Decreases multiple fields at one time. */
    decrease(fields: {
        [field: string]: number;
    }): Promise<this>;
    /** Decreases a specified field with an optional step. */
    decrease(field: string, step?: number): Promise<this>;
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
    chunk(length: number, cb: (this: this, data: any[]) => false | void): Promise<any[]>;
    /**
     * Gets paginated information of all records that suit given conditions.
     * @param page The current page.
     * @param length The top limit of how many records that each page will
     *  carry.
     */
    paginate(page: number, length?: number): Promise<PaginatedRecords>;
    /** Gets the select statement from the current instance. */
    getSelectSQL(): string;
    on(event: "query" | "insert" | "inserted" | "update" | "updated" | "delete" | "deleted" | "get", listener: (thisObj: this) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    // static on(event: "query" | "insert" | "inserted" | "update" | "updated" | "delete" | "deleted" | "get", listener: (query: Query) => void): typeof Query;
    // static on(event: string | symbol, listener: (...args: any[]) => void): typeof Query;
}
export declare namespace Query {
    class Field {
        name: string;
        constructor(name: string);
    }
}
