import { FieldConfig, ForeignKeyConfig } from "./interfaces";
import { DB } from "./DB";
import { Model } from "./Model";
import assign = require("lodash/assign");

/**
 * *Table Creator.*
 * 
 * This is a tool to generate DDL statements and create tables for Models, it 
 * provides some useful methods that let you create tables without too much 
 * effort.
 */
export class Table extends DB {
    name: string;
    schema: { [field: string]: FieldConfig } = {};
    private _current: string;

    /** Creates a new instance with a specified table name. */
    constructor(name: string, schema?: { [field: string]: FieldConfig });
    constructor(model: Model);
    constructor(...args) {
        super();
        if (args[0] instanceof Model) {
            let model: Model = args[0];
            this.name = model.table;
            this.schema = model.schema;
            this.use(model);
        } else {
            this.name = args[0];
            this.schema = args[1] || {};
        }

        for (let field in this.schema) {
            if (this.schema[field].name === undefined)
                this.schema[field].name = field;
        }
    }

    addColumn(name: string): this;
    addColumn(name: string, type: string): this;
    addColumn(name: string, type: string, length: number | [number, number]): this;
    addColumn(field: FieldConfig): this;
    addColumn(field: string | FieldConfig, type = "", length = 0) {
        let _field: FieldConfig;

        if (typeof field === "string") {
            this._current = field;
            _field = { name: field, type, length };
        } else {
            this._current = field.name;
            _field = field;
        }

        this.schema[this._current] = assign({}, FieldConfig, _field);
        return this;
    }

    /** Sets the current field to be the primary key of the table. */
    primary(): this {
        this.schema[this._current].primary = true;
        return this;
    }

    /** Sets the current field to be auto-increment. */
    autoIncrement(): this;

    /**
     * Sets the current field to be auto-increment with a `start` number and 
     * an optional `step` length.
     */
    autoIncrement(start: number, step?: number): this;

    autoIncrement(start = 1, step = 1) {
        this.schema[this._current].autoIncrement = [start, step];
        return this;
    }

    /** Sets the current field's value to be unique. */
    unique(): this {
        this.schema[this._current].unique = true;
        return this;
    }

    /** Sets a default value for the current field. */
    default(value: any): this {
        this.schema[this._current].default = value;
        return this;
    }

    /** Sets the current field cannot be null. */
    notNull(): this {
        this.schema[this._current].notNull = true;
        return this;
    }

    /** Sets the current field to be unsigned. */
    unsigned(): this {
        this.schema[this._current].unsigned = true;
        return this;
    }

    /** Adds a comment to the current field. */
    comment(text: string): this {
        this.schema[this._current].comment = text;
        return this;
    }

    /** Sets a foreign key constraint of the current field. */
    foreignKey(config: ForeignKeyConfig): this;

    /**
     * @param table A table where the the foreign key is in.
     * @param field A field in the foreign table that related to the current 
     *  field.
     * @param onDelete An action triggered when the record is deleted.
     * @param onUpdate An action triggered when the record is updated.
     */
    foreignKey(
        table: string,
        field: string,
        onDelete?: ForeignKeyConfig["onDelete"],
        onUpdate?: ForeignKeyConfig["onUpdate"]
    ): this;

    foreignKey(input, field?: string, onDelete = "set null", onUpdate = "no action") {
        let foreignKey: ForeignKeyConfig;

        if (typeof input === "object") {
            foreignKey = input;
        } else {
            foreignKey = <ForeignKeyConfig>{ table: input, field, onDelete, onUpdate };
        }

        this.schema[this._current].foreignKey = assign(
            {},
            this.schema[this._current].foreignKey,
            foreignKey
        );

        return this;
    }

    /** Gets the DDL statement by the definition. */
    getDDL(): string {
        return this.adapter.getDDL(this);
    }

    /** An alias of `table.getDDL()`. */
    toString() {
        return this.getDDL();
    }

    /** Creates the table in the database. */
    create(): Promise<this> {
        return this.adapter.create(this) as Promise<this>;
    }

    /** An alias of `table.create()`. */
    save(): Promise<this> {
        return this.create();
    }

    /** Drops the table from the database. */
    drop(): Promise<this> {
        return this.adapter.drop(this) as Promise<this>;
    }

    /**
     * Drops a table from the database.
     *
     * @param table The table name you're going to drop.
     */
    static drop(table: string): Promise<Table> {
        return (new this(table)).drop();
    }
}