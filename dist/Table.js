"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const DB_1 = require("./DB");
const Model_1 = require("./Model");
class Table extends DB_1.DB {
    constructor(...args) {
        super();
        this.schema = {};
        if (args[0] instanceof Model_1.Model) {
            let model = args[0];
            this.name = model.table;
            this.schema = model.schema;
            this.use(model);
        }
        else {
            this.name = args[0];
            this.schema = args[1] = {};
        }
    }
    addColumn(field, type = "", length = 0) {
        let _field;
        if (typeof field === "string") {
            this._current = field;
            _field = { name: field, type, length };
        }
        else {
            this._current = field.name;
            _field = field;
        }
        this.schema[this._current] = Object.assign({}, interfaces_1.FieldConfig, _field);
        return this;
    }
    primary() {
        this.schema[this._current].primary = true;
        return this;
    }
    autoIncrement(start = 1, step = 1) {
        this.schema[this._current].autoIncrement = [start, step];
        return this;
    }
    unique() {
        this.schema[this._current].unique = true;
        return this;
    }
    default(value) {
        this.schema[this._current].default = value;
        return this;
    }
    notNull() {
        this.schema[this._current].notNull = true;
        return this;
    }
    unsigned() {
        this.schema[this._current].unsigned = true;
        return this;
    }
    comment(text) {
        this.schema[this._current].comment = text;
        return this;
    }
    foreignKey(input, field, onDelete = "set null", onUpdate = "no action") {
        let foreignKey;
        if (typeof input === "object") {
            foreignKey = input;
        }
        else {
            foreignKey = { table: input, field, onDelete, onUpdate };
        }
        this.schema[this._current].foreignKey = Object.assign(this.schema[this._current].foreignKey, foreignKey);
        return this;
    }
    getDDL() {
        return this.adapter.getDDL(this);
    }
    create() {
        return this.adapter.create(this);
    }
    save() {
        return this.create();
    }
    drop() {
        return this.adapter.drop(this);
    }
    static drop(table) {
        return (new this(table)).drop();
    }
}
exports.Table = Table;
//# sourceMappingURL=Table.js.map