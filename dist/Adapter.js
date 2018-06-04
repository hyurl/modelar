"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var HideProtectedProperties = require("hide-protected-properties");
var Adapter = (function () {
    function Adapter() {
        this.connection = null;
        this.quote = "'";
        this.backquote = "`";
    }
    Adapter.close = function () {
        throw new ReferenceError("Static method Adapter.close() is not implemented.");
    };
    Adapter.prototype.transaction = function (db, cb) {
        var _this = this;
        if (typeof cb == "function") {
            return db.query("begin").then(function (db) {
                var res = cb.call(db, db);
                if (res && res.then instanceof Function) {
                    return res.then(function () { return db; });
                }
                else {
                    return db;
                }
            }).then(function (db) {
                return _this.commit(db);
            }).catch(function (err) {
                return _this.rollback(db).then(function () {
                    throw err;
                });
            });
        }
        else {
            return db.query("begin");
        }
    };
    Adapter.prototype.commit = function (db) {
        return db.query("commit");
    };
    Adapter.prototype.rollback = function (db) {
        return db.query("rollback");
    };
    Adapter.prototype.create = function (table) {
        return table.query(table.getDDL());
    };
    Adapter.prototype.drop = function (table) {
        var sql = "drop table " + table.backquote(table.name);
        return table.query(sql);
    };
    Adapter.prototype.random = function (query) {
        query["_orderBy"] = "random()";
        return query;
    };
    Adapter.prototype.limit = function (query, length, offset) {
        var limit = offset ? [offset, length] : length;
        query["_limit"] = limit;
        return query;
    };
    Adapter.prototype.getSelectSQL = function (query) {
        var isCount = (/count\(distinct\s\S+\)/i).test(query["_selects"]), distinct = query["_distinct"], selects = query["_selects"], join = query["_join"], where = query["_where"], orderBy = query["_orderBy"], groupBy = query["_groupBy"], having = query["_having"], union = query["_union"], limit;
        if (typeof query["_limit"] === "string")
            limit = query["_limit"];
        else if (query["_limit"])
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
    };
    Adapter = tslib_1.__decorate([
        HideProtectedProperties
    ], Adapter);
    return Adapter;
}());
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map