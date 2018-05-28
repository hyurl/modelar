"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var interfaces_1 = require("./interfaces");
var DB_1 = require("./DB");
var Model_1 = require("./Model");
var assign = require("lodash/assign");
var Table = (function (_super) {
    tslib_1.__extends(Table, _super);
    function Table() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.schema = {};
        if (args[0] instanceof Model_1.Model) {
            var model = args[0];
            _this.name = model.table;
            _this.schema = model.schema;
            _this.use(model);
        }
        else {
            _this.name = args[0];
            _this.schema = args[1] || {};
        }
        for (var field in _this.schema) {
            if (_this.schema[field].name === undefined)
                _this.schema[field].name = field;
        }
        return _this;
    }
    Table.prototype.addColumn = function (field, type, length) {
        if (type === void 0) { type = ""; }
        if (length === void 0) { length = 0; }
        var _field;
        if (typeof field === "string") {
            this._current = field;
            _field = { name: field, type: type, length: length };
        }
        else {
            this._current = field.name;
            _field = field;
        }
        this.schema[this._current] = assign({}, interfaces_1.FieldConfig, _field);
        return this;
    };
    Table.prototype.primary = function () {
        this.schema[this._current].primary = true;
        return this;
    };
    Table.prototype.autoIncrement = function (start, step) {
        if (start === void 0) { start = 1; }
        if (step === void 0) { step = 1; }
        this.schema[this._current].autoIncrement = [start, step];
        return this;
    };
    Table.prototype.unique = function () {
        this.schema[this._current].unique = true;
        return this;
    };
    Table.prototype.default = function (value) {
        this.schema[this._current].default = value;
        return this;
    };
    Table.prototype.notNull = function () {
        this.schema[this._current].notNull = true;
        return this;
    };
    Table.prototype.unsigned = function () {
        this.schema[this._current].unsigned = true;
        return this;
    };
    Table.prototype.comment = function (text) {
        this.schema[this._current].comment = text;
        return this;
    };
    Table.prototype.foreignKey = function (input, field, onDelete, onUpdate) {
        if (onDelete === void 0) { onDelete = "set null"; }
        if (onUpdate === void 0) { onUpdate = "no action"; }
        var foreignKey;
        if (typeof input === "object") {
            foreignKey = input;
        }
        else {
            foreignKey = { table: input, field: field, onDelete: onDelete, onUpdate: onUpdate };
        }
        this.schema[this._current].foreignKey = assign({}, this.schema[this._current].foreignKey, foreignKey);
        return this;
    };
    Table.prototype.getDDL = function () {
        return this.adapter.getDDL(this);
    };
    Table.prototype.toString = function () {
        return this.getDDL();
    };
    Table.prototype.create = function () {
        return this.adapter.create(this);
    };
    Table.prototype.save = function () {
        return this.create();
    };
    Table.prototype.drop = function () {
        return this.adapter.drop(this);
    };
    Table.drop = function (table) {
        return (new this(table)).drop();
    };
    return Table;
}(DB_1.DB));
exports.Table = Table;
//# sourceMappingURL=Table.js.map