"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HideProtectedProperties = require("hide-protected-properties");
let Adapter = class Adapter {
    constructor() {
        this.connection = null;
        this.quote = "'";
        this.backquote = "`";
    }
    static close() {
        throw new ReferenceError("Static method Adapter.close() is not implemented.");
    }
    transaction(db, cb) {
        if (typeof cb == "function") {
            return this.query(db, "begin").then(db => {
                let res = cb.call(db, db);
                if (res && res.then instanceof Function) {
                    return res.then(() => db);
                }
                else {
                    return db;
                }
            }).then(db => {
                return this.commit(db);
            }).catch(err => {
                return this.rollback(db).then(() => {
                    throw err;
                });
            });
        }
        else {
            return this.query(db, "begin");
        }
    }
    commit(db) {
        return this.query(db, "commit");
    }
    rollback(db) {
        return this.query(db, "rollback");
    }
    create(table) {
        return table.query(table.getDDL());
    }
    drop(table) {
        let sql = `drop table ${table.backquote(table.name)}`;
        return table.query(sql);
    }
    random(query) {
        query["_orderBy"] = "random()";
        return query;
    }
    limit(query, length, offset) {
        let limit = offset ? [offset, length] : length;
        query["_limit"] = limit;
        return query;
    }
    getSelectSQL(query) {
        let isCount = (/count\(distinct\s\S+\)/i).test(query["_selects"]), distinct = query["_distinct"], selects = query["_selects"], join = query["_join"], where = query["_where"], orderBy = query["_orderBy"], groupBy = query["_groupBy"], having = query["_having"], union = query["_union"], limit;
        if (typeof query["_limit"] === "string")
            limit = query["_limit"];
        else
            limit = query["_limit"].toString();
        return "select " +
            (distinct && !isCount ? "distinct " : "") +
            selects + " from " +
            (!join ? query.backquote(query.table) : "") +
            join +
            (where ? " where " + where : "") +
            (orderBy ? " order by " + orderBy : "") +
            (groupBy ? " group by " + groupBy : "") +
            (having ? " having " + having : "") +
            (limit ? " limit " + limit : "") +
            (union ? " union " + union : "");
    }
};
Adapter = tslib_1.__decorate([
    HideProtectedProperties
], Adapter);
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map