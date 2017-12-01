const DB = require('./DB');

/**
 * *Table Creator.*
 * 
 * This is a tool to generate DDL statements and create tables for Models, it 
 * provides some useful methods that let you create tables without too much 
 * effort.
 */
class Table extends DB {
    /**
     * Creates a new instance with a specified table name.
     * 
     * @param  {String}  table The table name.
     */
    constructor(table) {
        super();
        this._table = table;
        this._fields = []; // The field list of this table.
        this._index = -1; // Internal pointer.
    }

    /**
     * Adds a new column to the table.
     * 
     * @param  {String}  name  The name of the field.
     * 
     * @param  {String}  [type]  The type of the field.
     * 
     * @param  {Number}  [length]  The top limit of length that this field can
     *  store, also it could be an array carries only two numbers that 
     *  represents a range between bottom and top.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    addColumn(name, type = "", length = 0) {
        this._index += 1; // Move the pointer forward.
        this._fields.push(Object.assign({
            name: "",
            type: "",
            length: 0,
            notNull: false,
            default: undefined,
            primary: false,
            autoIncrement: false,
            unsigned: false,
            unique: false,
            comment: "",
            foreignKey: {
                table: "", // The name of the foreign table.
                field: "", // The binding field in the foreign table.
                // An action will be triggered when the record is deleted.
                // Optional value is: no action, set null, cascade, restrict
                onDelete: "set null",
                // An action will be triggered when the record is updated.
                // Optional value is: no action, set null, cascade, restrict
                onUpdate: "no action",
            },
        }, { name, type, length }));
        return this;
    }

    /********************* Field-Modifying Methods **********************/

    /**
     * Sets the current field to be the primary key of the table.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    primary() {
        this._fields[this._index].primary = true;
        return this;
    }

    /**
     * Sets the current field to be auto-increment.
     * 
     * @param  {Number}  [start]  The initial value.
     * 
     * @param  {Number}  [step]  The step length.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    autoIncrement(start = 1, step = 1) {
        this._fields[this._index].autoIncrement = [start, step];
        return this;
    }

    /**
     * Sets the current field's value to be unique.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    unique() {
        this._fields[this._index].unique = true;
        return this;
    }

    /**
     * Sets a default value for the current field.
     * 
     * @param  {String}  value  The default value.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    default(value) {
        this._fields[this._index].default = value;
        return this;
    }

    /**
     * Sets the current field cannot be null.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    notNull() {
        this._fields[this._index].notNull = true;
        return this;
    }

    /**
     * Sets the current field to be unsigned.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    unsigned() {
        this._fields[this._index].unsigned = true;
        return this;
    }

    /**
     * Adds a comment to the current field.
     * 
     * @param  {String}  text  The comment text.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    comment(text) {
        this._fields[this._index].comment = value;
        return this;
    }

    /**
     * Sets a foreign key constraint of the current field.
     * 
     * @param  {String|Object}  table  A table where the the foreign key is 
     *  in, it is also possible to pass this argument an object that sets all 
     *  the information of the constraint.
     * 
     * @param  {String}  field  A field in the foreign table that related to
     *  the current field.
     * 
     * @param  {String}  [onDelete]  An action triggered when the record is
     *  deleted. optional values are:
     *  - `no action`
     *  - `set null` (by default)
     *  - `cascade`
     *  - `restrict`
     * 
     * @param  {String}  [onUpdate]  An action triggered when the record is 
     *  updated (not supported by every database). optional values are:
     *  - `no action` (by default)
     *  - `set null`
     *  - `cascade`
     *  - `restrict`
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    foreignKey(table, field, onDelete = "set null", onUpdate = "no action") {
        if (table instanceof Object)
            var foreignKey = table;
        else
            var foreignKey = { table, field, onDelete, onUpdate };
        this._fields[this._index].foreignKey = Object.assign(
            this._fields[this._index].foreignKey,
            foreignKey
        );
        return this;
    }

    /**
     * Gets the DDL statement by the definition.
     * 
     * @return {String} Returns the DDL statement.
     */
    getDDL() {
        return this._adapter.getDDL(this);
    }

    /**
     * Creates the table in the database.
     * 
     * @return {Promise<Table>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the current instance.
     */
    create() {
        if (this._adapter.create instanceof Function) {
            return this._adapter.create(this);
        } else {
            return this.query(this.getDDL());
        }
    }

    /** An alias of table.create(). */
    save() {
        return this.create();
    }

    /**
     * Drops the table from the database.
     * 
     * @return {Promise<Table>} Returns a Promise, and the the only argument
     *  passed to the callback of `then()` is the current instance.
     */
    drop() {
        if (this._adapter.drop instanceof Function) {
            return this._adapter.drop(this);
        } else {
            return this.query(`drop table ${this.backquote(this._table)}`);
        }
    }

    /**
     * Drops the table from the database.
     * 
     * @param {String} table The table name you're going to drop.
     * 
     * @return {Promise<Table>} Returns a Promise, and the the only argument
     *  passed to the callback of `then()` is a new table instance.
     */
    static drop(table) {
        return (new this(table)).drop();
    }
}

module.exports = Table;