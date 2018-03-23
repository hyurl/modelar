"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("./Query");
const interfaces_1 = require("./interfaces");
const Table_1 = require("./Table");
const Errors_1 = require("./Errors");
class Model extends Query_1.Query {
    constructor(data, config) {
        super(config && config.table || "");
        this._whereState = { where: "", bindings: [] };
        this.data = {};
        this._modified = {};
        this.extra = {};
        config = config || interfaces_1.ModelConfig;
        this.fields = config.fields || this.fields || [];
        this.primary = config.primary || this.primary || "";
        this.searchable = config.searchable || this.searchable || [];
        this.schema = this.schema || {};
        this._initiated = this._initiated || false;
        if (this.fields.length && !this._initiated)
            this._defineProperties(this.fields);
        if (data) {
            delete data[this.primary];
            this.assign(data, true);
        }
    }
    get isNew() {
        return this.data[this.primary] == undefined;
    }
    _defineProperties(fields) {
        let proto = Object.getPrototypeOf(this);
        let props = {};
        for (let field of fields) {
            if (!(field in this)) {
                props[field] = {
                    get() {
                        return this.data[field];
                    },
                    set(v) {
                        if (field != this.primary) {
                            this.data[field] = v;
                            if (!this.isNew)
                                this._modified[field] = v;
                        }
                    }
                };
            }
            else {
                let desc = Object.getOwnPropertyDescriptor(proto, field);
                if (desc && desc.set) {
                    let oringin = desc.set;
                    desc.set = function set(v) {
                        oringin.call(this, v);
                        if (!this.isNew)
                            this._modified[field] = this.data[field];
                    };
                    props[field] = desc;
                }
            }
        }
        Object.defineProperties(proto, props);
        proto._initiated = true;
    }
    assign(data, useSetter = false) {
        if (this.data instanceof Array) {
            this.data = {};
        }
        let proto = Object.getPrototypeOf(this);
        for (let key in data) {
            if (this.fields.includes(key)) {
                if (useSetter) {
                    let desc = Object.getOwnPropertyDescriptor(proto, key);
                    if (desc && desc.set instanceof Function) {
                        desc.set.call(this, data[key]);
                    }
                    else {
                        this.data[key] = data[key];
                    }
                }
                else {
                    this.data[key] = data[key];
                }
                if (!this.isNew && key != this.primary) {
                    this._modified[key] = this.data[key];
                }
            }
            else {
                this.extra[key] = data[key];
            }
        }
        return this;
    }
    save() {
        this.emit("save", this);
        let exists = this.data[this.primary], promise = exists ? this.update() : this.insert();
        return promise.then(model => {
            this.emit("saved", model);
            return this;
        });
    }
    insert(data) {
        if (data)
            this.assign(data, true);
        return super.insert(this.data).then(model => {
            model.where(model.primary, model.insertId);
            return model.get();
        });
    }
    update(data) {
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        if (data) {
            delete data[this.primary];
            this.assign(data, true);
        }
        data = Object.assign({}, this._modified);
        if (Object.keys(data).length === 0) {
            return new Promise(resolve => {
                resolve(this);
            });
        }
        else {
            return super.update(data).then(model => {
                if (model.affectedRows == 0) {
                    throw new Errors_1.UpdateError("No " + this.constructor.name
                        + " was updated by the given condition.");
                }
                else {
                    model._resetWhere(true);
                    return model.get();
                }
            });
        }
    }
    increase(field, step = 1) {
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return this._handleCrease2(field, step, "+");
    }
    decrease(field, step = 1) {
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return this._handleCrease2(field, step, "-");
    }
    _handleCrease2(field, step, type) {
        let data, parts = [], bindings = [];
        if (typeof field == "object") {
            data = field;
        }
        else {
            data = {};
            data[field] = step;
        }
        delete data[this.primary];
        for (let field in data) {
            if (this.fields.includes(field) && data[field] > 0) {
                bindings.push(data[field]);
                field = this.backquote(field);
                parts.push(`${field} = ${field} ${type} ?`);
            }
        }
        return this["_handleUpdate"](parts, bindings).then(model => {
            if (model.affectedRows == 0) {
                throw new Errors_1.UpdateError("No " + this.constructor.name
                    + " was updated by the given condition.");
            }
            else {
                model._resetWhere(true);
                return model.get();
            }
        });
    }
    _resetWhere(resetState = false) {
        this["_where"] = "";
        this["_limit"] = 0;
        this["_bindings"] = [];
        this.bindings = [];
        if (resetState) {
            this._whereState.where = "";
            this._whereState.bindings = [];
        }
        this.where(this.primary, this.data[this.primary]);
        return this;
    }
    delete(id) {
        if (id) {
            return this.get(id).then(model => {
                return model.delete();
            });
        }
        if (!this["_where"]) {
            throw new SyntaxError("No where condition is set to delete models.");
        }
        this._resetWhere();
        if (this._whereState.where) {
            let state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return super.delete().then(model => {
            if (model.affectedRows == 0) {
                throw new Errors_1.DeletionError("No " + this.constructor.name
                    + " was deleted by the given condition.");
            }
            else {
                return model;
            }
        });
    }
    get(id) {
        if (id) {
            return this.where(this.primary, id).get();
        }
        if (!this["_where"]) {
            throw new SyntaxError("No where condition is set to fetch models.");
        }
        return super.get().then(data => {
            if (!data || Object.keys(data).length === 0) {
                throw new Errors_1.NotFoundError("No " + this.constructor.name
                    + " was found by the given condition.");
            }
            else {
                delete this._caller;
                delete this._foreignKey;
                delete this._type;
                delete this._pivot;
                this.assign(data);
                this._modified = {};
                this.emit("get", this);
                return this;
            }
        });
    }
    all() {
        return super.all().then(data => {
            if (data.length === 0) {
                throw new Errors_1.NotFoundError("No " + this.constructor.name
                    + " was found by the given condition.");
            }
            else {
                let models = [], ModelClass = this.constructor;
                for (let i in data) {
                    let model = new ModelClass;
                    model.use(this).assign(data[i]).emit("get", model);
                    models.push(model);
                }
                return models;
            }
        });
    }
    chunk(length, cb) {
        return super.chunk(length, cb);
    }
    paginate(page, length) {
        return super.paginate(page, length);
    }
    getMany(options) {
        let defaults = Object.assign(interfaces_1.ModelGetManyOptions, {
            orderBy: this.primary
        });
        options = Object.assign(defaults, options);
        let offset = (options.page - 1) * options.limit;
        this.limit(options.limit, offset);
        if (options.sequence !== "asc" && options.sequence != "desc")
            this.random();
        else
            this.orderBy(options.orderBy, options.sequence);
        for (let field of this.fields) {
            if (options[field] && defaults[field] === undefined) {
                let operator = "=", value = options[field];
                if (typeof value === "string") {
                    let match = value.match(/^(<>|!=|<=|>=|<|>|=)\w+/);
                    if (match) {
                        operator = match[1];
                        value = value.substring(operator.length);
                    }
                }
                this.where(field, operator, value);
            }
        }
        if (options.keywords && this.searchable) {
            let keywords = options.keywords, wildcard = this.config.type == "access" ? "*" : "%";
            if (typeof keywords == "string")
                keywords = [keywords];
            for (let i in keywords) {
                keywords[i] = keywords[i].replace("\\", "\\\\")
                    .replace(wildcard, "\\" + wildcard);
            }
            this.where((query) => {
                for (let field of this.searchable) {
                    query.orWhere((query) => {
                        for (let keyword of keywords) {
                            keyword = wildcard + keyword + wildcard;
                            query.orWhere(field, "like", keyword);
                        }
                    });
                }
            });
        }
        return this.paginate(options.page, options.limit).then(info => {
            return {
                page: options.page,
                pages: info.page,
                limit: options.limit,
                total: info.total,
                orderBy: options.orderBy,
                sequence: options.sequence,
                keywords: options.keywords,
                data: info.data
            };
        });
    }
    whereState(field, operator = null, value = undefined) {
        let query = new Query_1.Query().use(this);
        query.where(field, operator, value);
        this._whereState.where = query["_where"];
        this._whereState.bindings = query["_bindings"];
        return this;
    }
    valueOf() {
        let data = {}, proto = Object.getPrototypeOf(this);
        for (let key of this.fields) {
            let desc = Object.getOwnPropertyDescriptor(proto, key);
            if (desc && desc.get instanceof Function) {
                let value = desc.get.call(this, this.data[key]);
                if (value !== undefined)
                    data[key] = value;
            }
            else if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        return data;
    }
    toString(formatted = false) {
        if (formatted)
            return JSON.stringify(this, null, "  ");
        else
            return JSON.stringify(this);
    }
    toJSON() {
        return this.valueOf();
    }
    [Symbol.iterator]() {
        let data = this.valueOf();
        let Class = this.constructor;
        if (Class.oldIterator)
            console.warn("\nWarn: Using old style of iterator is deprecated.\n");
        return (function* () {
            for (let i in data) {
                yield Class.oldIterator ? [i, data[i]] : { key: i, value: data[i] };
            }
        })();
    }
    inspect() {
        let res = super["inspect"]();
        for (const field of this.fields) {
            res[field] = this[field];
        }
        return res;
    }
    createTable() {
        return new Table_1.Table(this).save().then(() => this);
    }
    static set(...args) {
        if (typeof args[0] === "string")
            return (new this).set(args[0], args[1]);
        else
            return (new this).set(args[0]);
    }
    static use(db) {
        return (new this).use(db);
    }
    static transaction(cb) {
        return (new this).transaction(cb);
    }
    static select(...args) {
        return (new this).select(...args);
    }
    static join(table, field1, operator, field2 = "") {
        return (new this).join(table, field1, operator, field2);
    }
    static leftJoin(table, field1, operator, field2 = "") {
        return (new this).leftJoin(table, field1, operator, field2);
    }
    static rightJoin(table, field1, operator, field2 = "") {
        return (new this).rightJoin(table, field1, operator, field2);
    }
    static fullJoin(table, field1, operator, field2 = "") {
        return (new this).fullJoin(table, field1, operator, field2);
    }
    static crossJoin(table, field1, operator, field2 = "") {
        return (new this).crossJoin(table, field1, operator, field2);
    }
    static where(field, operator = null, value = undefined) {
        return (new this).where(field, operator, value);
    }
    static whereBetween(field, [min, max]) {
        return (new this).whereBetween(field, [min, max]);
    }
    static whereNotBetween(field, [min, max]) {
        return (new this).whereNotBetween(field, [min, max]);
    }
    static whereIn(field, values) {
        return (new this).whereIn(field, values);
    }
    static whereNull(field) {
        return (new this).whereNull(field);
    }
    static whereNotNull(field) {
        return (new this).whereNotNull(field);
    }
    static whereExists(nested) {
        return (new this).whereExists(nested);
    }
    static whereNotExists(nested) {
        return (new this).whereNotExists(nested);
    }
    static orderBy(field, sequence) {
        return (new this).orderBy(field, sequence);
    }
    static random() {
        return (new this).random();
    }
    static groupBy(...fields) {
        return (new this).groupBy(...fields);
    }
    static having(raw) {
        return (new this).having(raw);
    }
    static limit(length, offset) {
        return (new this).limit(length, offset);
    }
    static distinct() {
        return (new this).distinct();
    }
    static insert(data) {
        return (new this).insert(data);
    }
    static delete(id) {
        return (new this).delete(id);
    }
    static get(id) {
        return (new this).get(id);
    }
    static all() {
        return (new this).all();
    }
    static count(field = "*") {
        return (new this).count(field);
    }
    static max(field) {
        return (new this).max(field);
    }
    static min(field) {
        return (new this).min(field);
    }
    static avg(field) {
        return (new this).avg(field);
    }
    static sum(field) {
        return (new this).sum(field);
    }
    static chunk(length, cb) {
        return (new this).chunk(length, cb);
    }
    static paginate(page, length = 10) {
        return (new this).paginate(page, length);
    }
    static getMany(options) {
        return (new this).getMany(options);
    }
    static whereState(field, operator = null, value = undefined) {
        return (new this).whereState(field, operator, value);
    }
    static createTable() {
        return (new this).createTable();
    }
    has(ModelClass, foreignKey, type = "") {
        let model = ModelClass.use(this);
        model.where(foreignKey, this.data[this.primary]);
        if (type) {
            model.where(type, this.constructor.name);
        }
        return model;
    }
    belongsTo(ModelClass, foreignKey, type = "") {
        let model = ModelClass.use(this);
        model._caller = this;
        model._foreignKey = foreignKey;
        model._type = type;
        if (type && ModelClass.name != this.data[type]) {
            return model.where(model.primary, null);
        }
        return model.where(model.primary, this.data[foreignKey]);
    }
    hasThrough(ModelClass, MiddleClass, foreignKey1, foreignKey2) {
        let model = new MiddleClass().use(this);
        return ModelClass.use(this).whereIn(foreignKey1, query => {
            query.select(model.primary).from(model.table)
                .where(foreignKey2, this.data[this.primary]);
        });
    }
    belongsToThrough(ModelClass, MiddleClass, foreignKey1, foreignKey2) {
        let model = new ModelClass().use(this), _model = new MiddleClass().use(this);
        return model.where(model.primary, query => {
            query.select(foreignKey2).from(_model.table)
                .where(_model.primary, this.data[foreignKey1]);
        });
    }
    hasVia(ModelClass, pivotTable, foreignKey1, foreignKey2, type = "") {
        let model = new ModelClass().use(this);
        model._caller = this;
        model._pivot = [
            pivotTable,
            foreignKey1,
            foreignKey2,
            type,
            this.constructor.name
        ];
        return model.whereIn(model.primary, query => {
            query.select(model._pivot[1]).from(model._pivot[0])
                .where(model._pivot[2], this.data[this.primary]);
            if (model._pivot[3]) {
                query.where(model._pivot[3], model._pivot[4]);
            }
        });
    }
    belongsToVia(ModelClass, pivotTable, foreignKey1, foreignKey2, type = "") {
        let model = new ModelClass().use(this);
        model._caller = this;
        model._pivot = [
            pivotTable,
            foreignKey2,
            foreignKey1,
            type,
            ModelClass.name
        ];
        return model.whereIn(model.primary, query => {
            query.select(model._pivot[1]).from(model._pivot[0])
                .where(model._pivot[2], this.data[this.primary]);
            if (model._pivot[3]) {
                query.where(model._pivot[3], model._pivot[4]);
            }
        });
    }
    withPivot(...args) {
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.withPivot() can only be called "
                + "after calling Model.hasVia() or Model.belongsToVia().");
        }
        let caller = this._caller, pivotTable = this._pivot[0], foreignKey1 = pivotTable + "." + this._pivot[1], foreignKey2 = pivotTable + "." + this._pivot[2], primary = this.table + "." + this.primary, fields = args[0] instanceof Array ? args[0] : args;
        fields = fields.map(field => pivotTable + "." + field);
        fields.unshift(this.table + ".*");
        return this.select(fields)
            .join(pivotTable, foreignKey1, primary)
            .where(foreignKey2, caller.data[caller.primary]);
    }
    associate(input) {
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.associate() can only be called "
                + "after calling Model.belongsTo().");
        }
        let target = this._caller, id = null;
        if (typeof input === "number") {
            id = input;
        }
        else if (input instanceof Model) {
            id = input.data[input.primary];
        }
        else {
            throw new TypeError("The only argument passed to "
                + "Model.associate() must be a number or an instance of "
                + "Model.");
        }
        target.data[this._foreignKey] = id;
        target._modified[this._foreignKey] = id;
        if (this._type) {
            target.data[this._type] = this.constructor.name;
            target._modified[this._type] = this.constructor.name;
        }
        return target.save();
    }
    dissociate() {
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.dissociate() can only be called "
                + "after calling Model.belongsTo().");
        }
        let target = this._caller;
        target.data[this._foreignKey] = null;
        target._modified[this._foreignKey] = null;
        if (this._type) {
            target.data[this._type] = null;
            target._modified[this._type] = null;
        }
        return target.save();
    }
    attach(models) {
        let notArray = !(models instanceof Array);
        if (notArray && typeof models !== "object") {
            throw new TypeError("The only argument passed to Model.attach()"
                + " must be an array or an object.");
        }
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.attach() can only be called after "
                + "calling Model.hasVia() or Model.belongsToVia().");
        }
        let target = this._caller, id1 = target.data[target.primary], ids = [];
        if (notArray) {
            for (let i in models) {
                let id = parseInt(i);
                if (models.hasOwnProperty(i) && !isNaN(id)) {
                    ids.push(id);
                }
            }
        }
        else {
            for (let model of models) {
                if (typeof model === "number") {
                    ids.push(model);
                }
                else if (model instanceof Model) {
                    ids.push(model.data[model.primary]);
                }
            }
        }
        let query = new Query_1.Query(this._pivot[0]).use(this);
        query.where(this._pivot[2], id1);
        if (this._pivot[3])
            query.where(this._pivot[3], this._pivot[4]);
        return query.all().then(data => {
            let exists = [], deletes = [], inserts = [], updates = [], _data = {};
            for (let single of data) {
                let id = single[this._pivot[1]];
                exists.push(id);
                _data[id] = single;
                if (!ids.includes(id)) {
                    deletes.push(id);
                }
            }
            for (let id of ids) {
                if (!exists.includes(id)) {
                    inserts.push(id);
                }
                else if (notArray) {
                    for (let i in models[id]) {
                        if (_data[id][i] !== undefined &&
                            _data[id][i] != models[id][i]) {
                            updates.push(id);
                            break;
                        }
                    }
                }
            }
            let _query = new Query_1.Query(this._pivot[0]).use(this);
            let doInsert = (query) => {
                let id = inserts.shift(), data = notArray ? models[id] : {};
                data[this._pivot[2]] = id1;
                data[this._pivot[1]] = id;
                if (this._pivot[3])
                    data[this._pivot[3]] = this._pivot[4];
                return query.insert(data).then(query => {
                    return inserts.length ? doInsert(query) : query;
                });
            };
            let doUpdate = (query) => {
                let id = updates.shift(), data = notArray ? models[id] : {};
                query["_where"] = "";
                query["_bindings"] = [];
                query.where(this._pivot[1], _data[id][this._pivot[1]])
                    .where(this._pivot[2], id1);
                delete data[this._pivot[2]];
                delete data[this._pivot[1]];
                if (this._pivot[3]) {
                    query.where(this._pivot[3], this._pivot[4]);
                    delete data[this._pivot[3]];
                }
                return query.update(data).then(query => {
                    return updates.length ? doUpdate(query) : query;
                });
            };
            if (deletes.length || updates.length || inserts.length) {
                return this.transaction(() => {
                    if (deletes.length) {
                        _query.whereIn(this._pivot[1], deletes)
                            .where(this._pivot[2], id1);
                        if (this._pivot[3])
                            _query.where(this._pivot[3], this._pivot[4]);
                        return _query.delete().then(_query => {
                            return updates.length ? doUpdate(_query) : _query;
                        }).then(_query => {
                            return inserts.length ? doInsert(_query) : _query;
                        });
                    }
                    else if (updates.length) {
                        return doUpdate(_query).then(_query => {
                            return inserts.length ? doInsert(_query) : _query;
                        });
                    }
                    else if (inserts.length) {
                        return doInsert(_query);
                    }
                }).then(() => target);
            }
            else {
                return target;
            }
        });
    }
    detach(models = []) {
        if (!(models instanceof Array)) {
            throw new TypeError("The only argument passed to Model.detach()"
                + " must be an array.");
        }
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.attach() can only be called after "
                + "calling Model.hasVia() or Model.belongsToVia().");
        }
        let target = this._caller, id1 = target.data[target.primary], query = new Query_1.Query(this._pivot[0]).use(this);
        query.where(this._pivot[2], id1);
        if (this._pivot[3])
            query.where(this._pivot[3], this._pivot[4]);
        if (models.length > 0) {
            let ids = [];
            for (let model of models) {
                if (typeof model === "number") {
                    ids.push(model);
                }
                else if (model instanceof Model) {
                    ids.push(model.data[model.primary]);
                }
            }
            if (ids.length)
                query.whereIn(this._pivot[1], ids);
        }
        return query.delete().then(() => target);
    }
}
Model.oldIterator = false;
exports.Model = Model;
Object.defineProperties(Model.prototype, {
    _extra: {
        get() {
            return this.extra;
        },
        set(v) {
            this.extra = v;
        }
    }
});
//# sourceMappingURL=Model.js.map