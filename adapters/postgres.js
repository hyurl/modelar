const { Pool } = require("pg");
const Adapter = require("../Adapter");
const Pools = {};

var getInsertId = (db, row, fields) => {
    var primary = db._primary || "id";
    for (let field of fields) {
        if (field.name.toLowerCase() == primary)
            return row[field.name];
    }
    return 0;
};

class PostgresAdapter extends Adapter {
    constructor() {
        super();
        this.backquote = "\"";
    }

    connect(db) {
        if (Pools[db._dsn] === undefined) {
            Pools[db._dsn] = new Pool(db._config);
        }
        return Pools[db._dsn].connect().then(client => {
            this.connection = client;
            return db;
        });
    }

    query(db, sql, bindings) {
        // Return the record when inserting.
        if (db._command == "insert" && sql.search(/returning\s/) <= 0)
            sql += " returning *";
        // Replace ? to ${n} of the SQL.
        for (let i in bindings) {
            sql = sql.replace("?", "$" + (parseInt(i) + 1));
        }
        return this.connection.query(sql, bindings).then(res => {
            if (!(res instanceof Array)) {
                db.affectedRows = res.rowCount || 0;
                if (db._command == "insert") {
                    // Deal with insert statements.
                    db.insertId = getInsertId(db, res.rows[0], res.fields);
                } else if (res.rows.length) {
                    // Deal with other statements.
                    db._data = res.rows.map(row => {
                        return Object.assign({}, row);
                    });
                }
            } else {
                var _res = res[res.length - 1];
                db.affectedRows = res.rowCount || 0;
                if (db._command == "insert") {
                    // Deal with insert statements.
                    db.insertId = getInsertId(db, _res.rows[0], _res.fields);
                } else {
                    db._data = [];
                    for (let __res of res) {
                        if (__res.rows.length) {
                            db._data.push(__res.rows.map(row => {
                                return Object.assign({}, row);
                            }));
                        }
                    }
                }
            }
            return db;
        });
    }

    release() {
        if (this.connection) {
            this.connection.release();
            this.connection = null;
        }
    }

    close() {
        this.release();
    }

    static close() {
        for (let i in Pools) {
            Pools[i].end();
            delete Pools[i];
        }
    }

    /** Methods for Table */

    getDDL(table) {
        var serials = ["smallserial", "serial", "bigserial"],
            columns = [],
            foreigns = [],
            primary,
            autoIncrement,
            sql;

        for (let field of table._fields) {
            if (field.primary && field.autoIncrement) {
                if (!serials.includes(field.type.toLowerCase())) {
                    field.type = "serial";
                }
                field.length = 0;
                if (field.autoIncrement instanceof Array) {
                    autoIncrement = `alter sequence ${table._table}_${field.name}_seq restart with ${field.autoIncrement[0]}`;
                }
            }
            if (field.length instanceof Array) {
                field.type += "(" + field.length.join(",") + ")";
            } else if (field.length) {
                field.type += "(" + field.length + ")";
            }

            let column = table.backquote(field.name) + " " + field.type;

            if (field.primary)
                primary = field.name;
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

        if (autoIncrement)
            sql += ";\n" + autoIncrement;

        return sql;
    }

    /** Methods for Query */

    limit(query, length, offset) {
        query._limit = offset ? length + " offset " + offset : length;
        return query;
    }
}

module.exports = PostgresAdapter;