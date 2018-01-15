import { FieldConfig, ForeignKeyConfig } from "./interfaces";
import { DB } from "./DB";
/**
 * *Table Creator.*
 *
 * This is a tool to generate DDL statements and create tables for Models, it
 * provides some useful methods that let you create tables without too much
 * effort.
 */
export declare class Table extends DB {
    protected _table: string;
    protected _fields: FieldConfig[];
    private _index: number;
    /** Creates a new instance with a specified table name. */
    constructor(name: string);
    addColumn(name: string): this;
    addColumn(name: string, type: string): this;
    addColumn(name: string, type: string, length: number | [number, number]): this;
    addColumn(field: FieldConfig): this;
    /** Sets the current field to be the primary key of the table. */
    primary(): this;
    /** Sets the current field to be auto-increment. */
    autoIncrement(): this;
    /**
     * Sets the current field to be auto-increment with a `start` number and
     * an optional `step` length.
     */
    autoIncrement(start: number, step?: number): this;
    /** Sets the current field's value to be unique. */
    unique(): this;
    /** Sets a default value for the current field. */
    default(value: string | number | boolean | void | Date): this;
    /** Sets the current field cannot be null. */
    notNull(): this;
    /** Sets the current field to be unsigned. */
    unsigned(): this;
    /** Adds a comment to the current field. */
    comment(text: string): this;
    /** Sets a foreign key constraint of the current field. */
    foreignKey(config: ForeignKeyConfig): this;
    /**
     * Sets a foreign key constraint of the current field.
     *
     * @param table A table where the the foreign key is in.
     * @param field A field in the foreign table that related to the current
     *  field.
     * @param onDelete An action triggered when the record is deleted.
     * @param onUpdate An action triggered when the record is updated.
     */
    foreignKey(table: string, field: string, onDelete?: "no action" | "set null" | "cascade" | "restrict", onUpdate?: "no action" | "set null" | "cascade" | "restrict"): this;
    /** Gets the DDL statement by the definition. */
    getDDL(): string;
    /** Creates the table in the database. */
    create(): Promise<this>;
    /** An alias of table.create(). */
    save(): Promise<this>;
    /** Drops the table from the database. */
    drop(): Promise<this>;
    /**
     * Drops the table from the database.
     *
     * @param table The table name you're going to drop.
     */
    static drop(table: string): Promise<Table>;
}
