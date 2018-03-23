const mysql = require("mysql");
const { Adapter } = require("../Adapter");
const Pools = {};

class MysqlAdapter extends Adapter {

    /** Methods for DB */

    connect(db) {
        if (Pools[db._dsn] === undefined) {
            var config = Object.assign({}, db._config);
            config.connectionLimit = config.max;
            Pools[db._dsn] = mysql.createPool(config);
        }
        return new Promise((resolve, reject) => {
            Pools[db._dsn].getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    this.connection = connection;
                    resolve(db);
                }
            });
        });
    }

    query(db, sql, bindings) {
        return new Promise((resolve, reject) => {
            this.connection.query({
                sql: sql,
                values: bindings,
                timeout: db._config.timeout,
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    if (res instanceof Array) {
                        // Deal with select or pragma statements, they 
                        // returns an array.
                        db._data = res.map(row => {
                            return Object.assign({}, row);
                        });
                    } else {
                        // Deal with other statements like insert/update/
                        // delete.
                        db.insertId = res.insertId;
                        db.affectedRows = res.affectedRows;
                    }
                    resolve(db);
                }
            });
        });
    }

    release() {
        if (this.connection) {
            this.connection.release();
            this.connection = null;
        }
    }

    close() {
        if (this.connection)
            this.connection.destroy();
    }

    static close() {
        for (let i in Pools) {
            Pools[i].end();
            delete Pools[i];
        }
    }

    /** Methods for Table */

    getDDL(table) {
        var numbers = ["int", "integer"],
            columns = [],
            foreigns = [],
            primary,
            autoIncrement = "",
            sql;

        for (let field of table._fields) {
            if (field.primary && field.autoIncrement) {
                if (!numbers.includes(field.type.toLowerCase())) {
                    field.type = "int";
                    if (!field.length)
                        field.length = 10;
                }
                autoIncrement = " auto_increment=" + field.autoIncrement[0];
            }
            if (field.length instanceof Array) {
                field.type += "(" + field.length.join(",") + ")";
            } else if (field.length) {
                field.type += "(" + field.length + ")";
            }

            let column = table.backquote(field.name) + " " + field.type;

            if (field.primary)
                primary = field.name;
            if (field.autoIncrement)
                column += " auto_increment";
            if (field.default === null)
                column += " default null";
            else if (field.default !== undefined)
                column += " default " + table.quote(field.default);
            if (field.notNull)
                column += " not null";
            if (field.unsigned)
                column += " unsigned";
            if (field.unique)
                column += " unique";
            if (field.comment)
                column += " comment " + table.quote(field.comment);
            if (field.foreignKey.table) {
                let foreign = `foreign key (${table.backquote(field.name)})` +
                    " references " + table.backquote(field.foreignKey.table) +
                    " (" + table.backquote(field.foreignKey.field) + ")" +
                    " on delete " + field.foreignKey.onDelete +
                    " on update " + field.foreignKey.onUpdate;
                foreigns.push(foreign);
            };
            columns.push(column);
        }

        sql = "create table " + table.backquote(table._table) +
            " (\n\t" + columns.join(",\n\t");

        if (primary)
            sql += ",\n\tprimary key(" + table.backquote(primary) + ")";

        if (foreigns.length)
            sql += ",\n\t" + foreigns.join(",\n\t");

        sql += "\n)";

        if (table._config.type === "maria")
            sql += " engine=Aria transactional=1";
        else
            sql += " engine=InnoDB";

        return sql + ` default charset=${table._config.charset}` + autoIncrement;
    }

    /** Methods for Query */

    random(query) {
        query._orderBy = "rand()";
        return query;
    }
}

module.exports = MysqlAdapter;