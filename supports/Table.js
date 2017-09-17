"use strict";

const DB = require('./DB'); //Import DB class.

/**
 * *Database Table Manager.*
 * 
 * This is a tool to generate DDL statements and create tables for Models, it 
 * provides some useful methods that let you create tables without too much 
 * effort.
 */
class Table extends DB {
    /**
     * Creates a new instance with a specified table name.
     * 
     * @param  {String} table The table name.
     */
    constructor(table) {
        super();
        this.__table = this.__backquote(table);
        this.__fields = []; //The field list of this table.
        this.__index = -1; //Internal pointer.
    }

    /**
     * Adds a new column to the table.
     * 
     * @param  {String}  name   The name of the field.
     * @param  {String}  type   The type of the field.
     * @param  {Number}  length [optional] The top limit of length that this 
     *                          field can store, also it could be an array 
     *                          carries only two numbers that represents a 
     *                          range between bottom and top.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    addColumn(name, type, length = 0) {
        this.__index += 1; //Move the pointer forward.
        if (length) {
            if (length instanceof Array)
                length = length.join(",");
            type += "(" + length + ")";
        }
        this.__fields.push(Object.assign({
            name: "",
            type: "",
            notNull: false,
            default: undefined,
            primary: false,
            autoIncrement: false,
            unsigned: false,
            unique: false,
            comment: "",
            foreignKey: {
                table: "", //The name of the foreign table.
                field: "", //The binding field in the foreign table.
                //An action will be triggered when the record is updated.
                //Optional value is: no action, set null, cascade, restrict
                onUpdate: "no action",
                //An action will be triggered when the record is deleted.
                //Optional value is: no action, set null, cascade, restrict
                onDelete: "no action",
            },
        }, { name, type }));
        return this;
    }

    /********************* Field-Modifying Methods **********************/

    /**
     * Sets the current field to be the primary key of the table.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    primary() {
        this.__fields[this.__index].primary = true;
        return this;
    }

    /**
     * Sets the current field to be auto-increment.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    autoIncrement() {
        this.__fields[this.__index].autoIncrement = true;
        return this;
    }

    /**
     * Sets the current field's value to be unique.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    unique() {
        this.__fields[this.__index].unique = true;
        return this;
    }

    /**
     * Sets a default value for the current field.
     * 
     * @param  {String} value The default value.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    default (value) {
        this.__fields[this.__index].default = value;
        return this;
    }

    /**
     * Sets the current field cannot be null.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    notNull() {
        this.__fields[this.__index].notNull = true;
        return this;
    }

    /**
     * Sets the current field to be unsigned.
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    unsigned() {
        this.__fields[this.__index].unsigned = true;
        return this;
    }

    /**
     * Adds a comment to the current field.
     * 
     * @param  {String} text The comment text.
     * 
     * @return {Table}  Returns the current instance for function chaining.
     */
    comment(text) {
        this.__fields[this.__index].comment = value;
        return this;
    }

    /**
     * Sets a foreign key constraint of the current field.
     * 
     * @param  {Any}    table    A table where the the foreign key is in, it 
     *                           is also possible to pass this argument an 
     *                           object that sets all the information of the 
     *                           constraint.
     * @param  {String} field    [optional] A field in the foreign table that 
     *                           related to the current field.
     * @param  {String} onUpdate [optional] An action triggered when the 
     *                           record is updated. optional values are: 
     *                           - `no action`
     *                           - `set null`
     *                           - `cascade`
     *                           - `restrict`
     * @param  {String} onDelete [optional] An action triggered when the 
     *                           record is deleted. optional values are: 
     *                           - `no action`
     *                           - `set null`
     *                           - `cascade`
     *                           - `restrict`
     * 
     * @return {Table} Returns the current instance for function chaining.
     */
    foreignKey(table, field = "", onUpdate = "", onDelete = "") {
        if (table instanceof Object)
            var foreignKey = table;
        else
            var foreignKey = { table, field, onUpdate, onDelete };
        this.__fields[this.__index].foreignKey = Object.assign(
            this.__fields[this.__index].foreignKey,
            foreignKey
        );
        return this;
    }

    /********************************************************************/

    /**
     * Saves the table, this method actually creates a new table in the 
     * database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    save() {
        return this.query(this.getDDL()).then(db => {
            return this;
        });
    }

    /**
     * Gets the DDL statement by the definitions.
     * 
     * @return {String} Returns the DDL statement.
     */
    getDDL() {
        var columns = [],
            foreigns = [],
            primary = "",
            isSqlite = this.__config.type == "sqlite",
            isMysql = this.__config.type == "mysql",
            isPostgres = this.__config.type == "postgres";

        for (let field of this.__fields) {
            let column = this.__backquote(field.name) + " " + field.type;
            //Deal with primary key.
            if (field.primary && isSqlite)
                column += " primary key";
            else
                primary = field.name;
            //Deal with auto-increment.
            if (field.autoIncrement) {
                if (isSqlite)
                    column += " autoincrement"; //SQLite
                else if (isMysql)
                    column += " auto_increment"; //MySQL
            }
            if (field.default === null) {
                column += " default null";
            } else if (field.default !== undefined) {
                if (typeof field.default == "string")
                    column += " default " + this.__quote(field.default);
                else
                    column += " default " + field.default;
            }
            if (field.notNull) column += " not null";
            if (field.unsigned) column += " unsigned";
            if (field.unique) column += " unique";
            if (field.comment)
                column += " comment " + this.__quote(field.comment);
            if (field.foreignKey.table) {
                var foreign = " references " +
                    this.__backquote(field.foreignKey.table) +
                    " (" + this.__backquote(field.foreignKey.field) +
                    ") on delete " +
                    field.foreignKey.onDelete + " on update " +
                    field.foreignKey.onUpdate;
                if (isSqlite) {
                    column += foreign;
                } else if (isMysql || isPostgres) {
                    //MySQL puts the foreign key constraint at the end of DDL.
                    foreign = "foreign key (" + this.__backquote(field.name) +
                        ")" + foreign;
                    foreigns.push(foreign);
                }
            };
            columns.push(column);
        }

        this.sql = "create table " + this.__table + " (\n\t" +
            columns.join(",\n\t");

        //Handle primary key for MySQL or PostgreSQL.
        if (isMysql || isPostgres && primary)
            this.sql += ",\n\tprimary key(" + this.__backquote(primary) + ")";

        //Handle foreign key constraints for MySQL or PostgreSQL.
        if (foreigns.length)
            this.sql += ",\n\t" + foreigns.join(",\n\t");

        this.sql += "\n)";

        if (isMysql) { //Set the engine and charset for MySQL.
            this.sql += " engine=InnoDB default charset=" +
                this.__config.charset;
        }
        return this.sql;
    }
}

module.exports = Table;