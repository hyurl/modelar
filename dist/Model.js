"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Query_1 = require("./Query");
var interfaces_1 = require("./interfaces");
var Table_1 = require("./Table");
var Errors_1 = require("./Errors");
var assign = require("lodash/assign");
var inspect = require("util").inspect.custom || "inspect";
var Model = (function (_super) {
    tslib_1.__extends(Model, _super);
    function Model(data, config) {
        var _this = _super.call(this, config && config.table || "") || this;
        _this._whereState = { where: "", bindings: [] };
        _this.data = {};
        _this._modified = {};
        _this.extra = {};
        config = config || interfaces_1.ModelConfig;
        _this.fields = config.fields || _this.fields || [];
        _this.primary = config.primary || _this.primary || "";
        _this.searchable = config.searchable || _this.searchable || [];
        _this.schema = _this.schema || {};
        _this._initiated = _this._initiated || false;
        _this["_isModel"] = true;
        if (_this.fields.length && !_this._initiated)
            _this._defineProperties(_this.fields);
        if (data) {
            delete data[_this.primary];
            _this.assign(data, true);
        }
        return _this;
    }
    Object.defineProperty(Model.prototype, "isNew", {
        get: function () {
            return this.data[this.primary] == undefined;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype._defineProperties = function (fields) {
        var proto = Object.getPrototypeOf(this);
        var props = {};
        var _loop_1 = function (field) {
            if (!(field in this_1)) {
                props[field] = {
                    get: function () {
                        return this.data[field];
                    },
                    set: function (v) {
                        if (field != this.primary) {
                            this.data[field] = v;
                            if (!this.isNew)
                                this._modified[field] = v;
                        }
                    }
                };
            }
            else {
                var desc = Object.getOwnPropertyDescriptor(proto, field);
                if (desc && desc.set) {
                    var oringin_1 = desc.set;
                    desc.set = function set(v) {
                        oringin_1.call(this, v);
                        if (!this.isNew)
                            this._modified[field] = this.data[field];
                    };
                    props[field] = desc;
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            _loop_1(field);
        }
        Object.defineProperties(proto, props);
        proto._initiated = true;
    };
    Model.prototype.assign = function (data, useSetter) {
        if (useSetter === void 0) { useSetter = false; }
        if (this.data instanceof Array) {
            this.data = {};
        }
        var proto = Object.getPrototypeOf(this);
        for (var key in data) {
            if (this.fields.indexOf(key) >= 0) {
                if (useSetter) {
                    var desc = Object.getOwnPropertyDescriptor(proto, key);
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
    };
    Model.prototype.save = function () {
        var _this = this;
        this.emit("save", this);
        var exists = this.data[this.primary], promise = exists ? this.update() : this.insert();
        return promise.then(function (model) {
            _this.emit("saved", model);
            return _this;
        });
    };
    Model.prototype.insert = function (data) {
        if (data)
            this.assign(data, true);
        return _super.prototype.insert.call(this, this.data).then(function (model) {
            model.where(model.primary, model.insertId);
            return model.get();
        });
    };
    Model.prototype.update = function (data) {
        var _this = this;
        this._resetWhere();
        if (this._whereState.where) {
            var state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        if (data) {
            delete data[this.primary];
            this.assign(data, true);
        }
        data = assign({}, this._modified);
        if (Object.keys(data).length === 0) {
            return new Promise(function (resolve) {
                resolve(_this);
            });
        }
        else {
            return _super.prototype.update.call(this, data).then(function (model) {
                if (model.affectedRows == 0) {
                    throw new Errors_1.UpdateError("No " + _this.constructor["name"]
                        + " was updated by the given condition.");
                }
                else {
                    model._resetWhere(true);
                    return model.get();
                }
            });
        }
    };
    Model.prototype.increase = function (field, step) {
        if (step === void 0) { step = 1; }
        this._resetWhere();
        if (this._whereState.where) {
            var state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return this._handleCrease2(field, step, "+");
    };
    Model.prototype.decrease = function (field, step) {
        if (step === void 0) { step = 1; }
        this._resetWhere();
        if (this._whereState.where) {
            var state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return this._handleCrease2(field, step, "-");
    };
    Model.prototype._handleCrease2 = function (field, step, type) {
        var _this = this;
        var data, parts = [], bindings = [];
        if (typeof field == "object") {
            data = field;
        }
        else {
            data = {};
            data[field] = step;
        }
        delete data[this.primary];
        for (var field_1 in data) {
            if (this.fields.indexOf(field_1) >= 0 && data[field_1] > 0) {
                bindings.push(data[field_1]);
                field_1 = this.backquote(field_1);
                parts.push(field_1 + " = " + field_1 + " " + type + " ?");
            }
        }
        return this["_handleUpdate"](parts, bindings).then(function (model) {
            if (model.affectedRows == 0) {
                throw new Errors_1.UpdateError("No " + _this.constructor["name"]
                    + " was updated by the given condition.");
            }
            else {
                model._resetWhere(true);
                return model.get();
            }
        });
    };
    Model.prototype._resetWhere = function (resetState) {
        if (resetState === void 0) { resetState = false; }
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
    };
    Model.prototype.delete = function (id) {
        var _this = this;
        if (id) {
            return this.get(id).then(function (model) {
                return model.delete();
            });
        }
        if (!this["_where"]) {
            throw new SyntaxError("No where condition is set to delete models.");
        }
        this._resetWhere();
        if (this._whereState.where) {
            var state = this._whereState;
            this["_where"] += " and " + state.where;
            this["_bindings"] = this["_bindings"].concat(state.bindings);
        }
        return _super.prototype.delete.call(this).then(function (model) {
            if (model.affectedRows == 0) {
                throw new Errors_1.DeletionError("No " + _this.constructor["name"]
                    + " was deleted by the given condition.");
            }
            else {
                return model;
            }
        });
    };
    Model.prototype.get = function (id) {
        var _this = this;
        if (id) {
            return this.where(this.primary, id).get();
        }
        if (!this["_where"]) {
            throw new SyntaxError("No where condition is set to fetch models.");
        }
        return _super.prototype.get.call(this).then(function (data) {
            if (!data || Object.keys(data).length === 0) {
                throw new Errors_1.NotFoundError("No " + _this.constructor["name"]
                    + " was found by the given condition.");
            }
            else {
                delete _this._caller;
                delete _this._foreignKey;
                delete _this._type;
                delete _this._pivot;
                _this.assign(data);
                _this._modified = {};
                _this.emit("get", _this);
                return _this;
            }
        });
    };
    Model.prototype.all = function () {
        var _this = this;
        return _super.prototype.all.call(this).then(function (data) {
            if (data.length === 0) {
                throw new Errors_1.NotFoundError("No " + _this.constructor["name"]
                    + " was found by the given condition.");
            }
            else {
                var models = [], ModelClass = _this.constructor;
                for (var i in data) {
                    var model = new ModelClass;
                    model.use(_this).assign(data[i]).emit("get", model);
                    models.push(model);
                }
                return models;
            }
        });
    };
    Model.prototype.chunk = function (length, cb) {
        return _super.prototype.chunk.call(this, length, cb);
    };
    Model.prototype.paginate = function (page, length) {
        return _super.prototype.paginate.call(this, page, length);
    };
    Model.prototype.getMany = function (options) {
        var _this = this;
        var defaults = assign(interfaces_1.ModelGetManyOptions, {
            orderBy: this.primary
        });
        options = assign(defaults, options);
        var offset = (options.page - 1) * options.limit;
        this.limit(options.limit, offset);
        if (options.sequence !== "asc" && options.sequence != "desc")
            this.random();
        else
            this.orderBy(options.orderBy, options.sequence);
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            if (options[field] && defaults[field] === undefined) {
                var operator = "=", value = options[field];
                if (typeof value === "string") {
                    var match = value.match(/^(<>|!=|<=|>=|<|>|=)\w+/);
                    if (match) {
                        operator = match[1];
                        value = value.substring(operator.length);
                    }
                }
                this.where(field, operator, value);
            }
        }
        if (options.keywords && this.searchable) {
            var keywords_1 = options.keywords, wildcard_1 = this.config.type == "access" ? "*" : "%";
            if (typeof keywords_1 == "string")
                keywords_1 = [keywords_1];
            for (var i in keywords_1) {
                keywords_1[i] = keywords_1[i].replace("\\", "\\\\")
                    .replace(wildcard_1, "\\" + wildcard_1);
            }
            this.where(function (query) {
                var _loop_2 = function (field) {
                    query.orWhere(function (query) {
                        for (var _i = 0, keywords_2 = keywords_1; _i < keywords_2.length; _i++) {
                            var keyword = keywords_2[_i];
                            keyword = wildcard_1 + keyword + wildcard_1;
                            query.orWhere(field, "like", keyword);
                        }
                    });
                };
                for (var _i = 0, _a = _this.searchable; _i < _a.length; _i++) {
                    var field = _a[_i];
                    _loop_2(field);
                }
            });
        }
        return this.paginate(options.page, options.limit).then(function (info) {
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
    };
    Model.prototype.whereState = function (field, operator, value) {
        if (operator === void 0) { operator = null; }
        if (value === void 0) { value = undefined; }
        var query = new Query_1.Query().use(this);
        query.where(field, operator, value);
        this._whereState.where = query["_where"];
        this._whereState.bindings = query["_bindings"];
        return this;
    };
    Model.prototype.valueOf = function () {
        var data = {}, proto = Object.getPrototypeOf(this);
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var key = _a[_i];
            var desc = Object.getOwnPropertyDescriptor(proto, key);
            if (desc && desc.get instanceof Function) {
                var value = desc.get.call(this, this.data[key]);
                if (value !== undefined)
                    data[key] = value;
            }
            else if (this.data[key] !== undefined) {
                data[key] = this.data[key];
            }
        }
        return data;
    };
    Model.prototype.toString = function (formatted) {
        if (formatted === void 0) { formatted = false; }
        if (formatted)
            return JSON.stringify(this, null, "  ");
        else
            return JSON.stringify(this);
    };
    Model.prototype.toJSON = function () {
        return this.valueOf();
    };
    Model.prototype[Symbol.iterator] = function () {
        var data = this.valueOf();
        var Class = this.constructor;
        if (Class.oldIterator)
            console.warn("\nWarn: Using old style of iterator is deprecated.\n");
        return (function () {
            var _a, _b, _i, key, value;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in data)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 4];
                        key = _a[_i];
                        value = data[key];
                        return [4, Class.oldIterator ? [key, value] : { key: key, value: value }];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        })();
    };
    Model.prototype[inspect] = function () {
        var res = _super.prototype["inspect"].call(this);
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            res[field] = this[field];
        }
        return res;
    };
    Model.prototype.createTable = function () {
        var _this = this;
        return new Table_1.Table(this).save().then(function () { return _this; });
    };
    Model.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof args[0] === "string")
            return (new this).set(args[0], args[1]);
        else
            return (new this).set(args[0]);
    };
    Model.use = function (db) {
        return (new this).use(db);
    };
    Model.transaction = function (cb) {
        return (new this).transaction(cb);
    };
    Model.select = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = (new this)).select.apply(_a, args);
        var _a;
    };
    Model.join = function (table, field1, operator, field2) {
        if (field2 === void 0) { field2 = ""; }
        return (new this).join(table, field1, operator, field2);
    };
    Model.leftJoin = function (table, field1, operator, field2) {
        if (field2 === void 0) { field2 = ""; }
        return (new this).leftJoin(table, field1, operator, field2);
    };
    Model.rightJoin = function (table, field1, operator, field2) {
        if (field2 === void 0) { field2 = ""; }
        return (new this).rightJoin(table, field1, operator, field2);
    };
    Model.fullJoin = function (table, field1, operator, field2) {
        if (field2 === void 0) { field2 = ""; }
        return (new this).fullJoin(table, field1, operator, field2);
    };
    Model.crossJoin = function (table, field1, operator, field2) {
        if (field2 === void 0) { field2 = ""; }
        return (new this).crossJoin(table, field1, operator, field2);
    };
    Model.where = function (field, operator, value) {
        if (operator === void 0) { operator = null; }
        if (value === void 0) { value = undefined; }
        return (new this).where(field, operator, value);
    };
    Model.whereBetween = function (field, _a) {
        var min = _a[0], max = _a[1];
        return (new this).whereBetween(field, [min, max]);
    };
    Model.whereNotBetween = function (field, _a) {
        var min = _a[0], max = _a[1];
        return (new this).whereNotBetween(field, [min, max]);
    };
    Model.whereIn = function (field, values) {
        return (new this).whereIn(field, values);
    };
    Model.whereNull = function (field) {
        return (new this).whereNull(field);
    };
    Model.whereNotNull = function (field) {
        return (new this).whereNotNull(field);
    };
    Model.whereExists = function (nested) {
        return (new this).whereExists(nested);
    };
    Model.whereNotExists = function (nested) {
        return (new this).whereNotExists(nested);
    };
    Model.orderBy = function (field, sequence) {
        return (new this).orderBy(field, sequence);
    };
    Model.random = function () {
        return (new this).random();
    };
    Model.groupBy = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        return (_a = (new this)).groupBy.apply(_a, fields);
        var _a;
    };
    Model.having = function (raw) {
        return (new this).having(raw);
    };
    Model.limit = function (length, offset) {
        return (new this).limit(length, offset);
    };
    Model.distinct = function () {
        return (new this).distinct();
    };
    Model.insert = function (data) {
        return (new this).insert(data);
    };
    Model.delete = function (id) {
        return (new this).delete(id);
    };
    Model.get = function (id) {
        return (new this).get(id);
    };
    Model.all = function () {
        return (new this).all();
    };
    Model.count = function (field) {
        if (field === void 0) { field = "*"; }
        return (new this).count(field);
    };
    Model.max = function (field) {
        return (new this).max(field);
    };
    Model.min = function (field) {
        return (new this).min(field);
    };
    Model.avg = function (field) {
        return (new this).avg(field);
    };
    Model.sum = function (field) {
        return (new this).sum(field);
    };
    Model.chunk = function (length, cb) {
        return (new this).chunk(length, cb);
    };
    Model.paginate = function (page, length) {
        if (length === void 0) { length = 10; }
        return (new this).paginate(page, length);
    };
    Model.getMany = function (options) {
        return (new this).getMany(options);
    };
    Model.whereState = function (field, operator, value) {
        if (operator === void 0) { operator = null; }
        if (value === void 0) { value = undefined; }
        return (new this).whereState(field, operator, value);
    };
    Model.createTable = function () {
        return (new this).createTable();
    };
    Model.prototype.has = function (ModelClass, foreignKey, type) {
        if (type === void 0) { type = ""; }
        var model = ModelClass.use(this);
        model.where(foreignKey, this.data[this.primary]);
        if (type) {
            model.where(type, this.constructor["name"]);
        }
        return model;
    };
    Model.prototype.belongsTo = function (ModelClass, foreignKey, type) {
        if (type === void 0) { type = ""; }
        var model = ModelClass.use(this);
        model._caller = this;
        model._foreignKey = foreignKey;
        model._type = type;
        if (type && ModelClass["name"] != this.data[type]) {
            return model.where(model.primary, null);
        }
        return model.where(model.primary, this.data[foreignKey]);
    };
    Model.prototype.hasThrough = function (ModelClass, MiddleClass, foreignKey1, foreignKey2) {
        var _this = this;
        var model = new MiddleClass().use(this);
        return ModelClass.use(this).whereIn(foreignKey1, function (query) {
            query.select(model.primary).from(model.table)
                .where(foreignKey2, _this.data[_this.primary]);
        });
    };
    Model.prototype.belongsToThrough = function (ModelClass, MiddleClass, foreignKey1, foreignKey2) {
        var _this = this;
        var model = new ModelClass().use(this), _model = new MiddleClass().use(this);
        return model.where(model.primary, function (query) {
            query.select(foreignKey2).from(_model.table)
                .where(_model.primary, _this.data[foreignKey1]);
        });
    };
    Model.prototype.hasVia = function (ModelClass, pivotTable, foreignKey1, foreignKey2, type) {
        var _this = this;
        if (type === void 0) { type = ""; }
        var model = new ModelClass().use(this);
        model._caller = this;
        model._pivot = [
            pivotTable,
            foreignKey1,
            foreignKey2,
            type,
            this.constructor["name"]
        ];
        return model.whereIn(model.primary, function (query) {
            query.select(model._pivot[1]).from(model._pivot[0])
                .where(model._pivot[2], _this.data[_this.primary]);
            if (model._pivot[3]) {
                query.where(model._pivot[3], model._pivot[4]);
            }
        });
    };
    Model.prototype.belongsToVia = function (ModelClass, pivotTable, foreignKey1, foreignKey2, type) {
        var _this = this;
        if (type === void 0) { type = ""; }
        var model = new ModelClass().use(this);
        model._caller = this;
        model._pivot = [
            pivotTable,
            foreignKey2,
            foreignKey1,
            type,
            ModelClass["name"]
        ];
        return model.whereIn(model.primary, function (query) {
            query.select(model._pivot[1]).from(model._pivot[0])
                .where(model._pivot[2], _this.data[_this.primary]);
            if (model._pivot[3]) {
                query.where(model._pivot[3], model._pivot[4]);
            }
        });
    };
    Model.prototype.withPivot = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.withPivot() can only be called "
                + "after calling Model.hasVia() or Model.belongsToVia().");
        }
        var caller = this._caller, pivotTable = this._pivot[0], foreignKey1 = pivotTable + "." + this._pivot[1], foreignKey2 = pivotTable + "." + this._pivot[2], primary = this.table + "." + this.primary, fields = args[0] instanceof Array ? args[0] : args;
        fields = fields.map(function (field) { return pivotTable + "." + field; });
        fields.unshift(this.table + ".*");
        return this.select(fields)
            .join(pivotTable, foreignKey1, primary)
            .where(foreignKey2, caller.data[caller.primary]);
    };
    Model.prototype.associate = function (input) {
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.associate() can only be called "
                + "after calling Model.belongsTo().");
        }
        var target = this._caller, id = null;
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
            target.data[this._type] = this.constructor["name"];
            target._modified[this._type] = this.constructor["name"];
        }
        return target.save();
    };
    Model.prototype.dissociate = function () {
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.dissociate() can only be called "
                + "after calling Model.belongsTo().");
        }
        var target = this._caller;
        target.data[this._foreignKey] = null;
        target._modified[this._foreignKey] = null;
        if (this._type) {
            target.data[this._type] = null;
            target._modified[this._type] = null;
        }
        return target.save();
    };
    Model.prototype.attach = function (models) {
        var _this = this;
        var notArray = !(models instanceof Array);
        if (notArray && typeof models !== "object") {
            throw new TypeError("The only argument passed to Model.attach()"
                + " must be an array or an object.");
        }
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.attach() can only be called after "
                + "calling Model.hasVia() or Model.belongsToVia().");
        }
        var target = this._caller, id1 = target.data[target.primary], ids = [];
        if (notArray) {
            for (var i in models) {
                var id = parseInt(i);
                if (models.hasOwnProperty(i) && !isNaN(id)) {
                    ids.push(id);
                }
            }
        }
        else {
            for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
                var model = models_1[_i];
                if (typeof model === "number") {
                    ids.push(model);
                }
                else if (model instanceof Model) {
                    ids.push(model.data[model.primary]);
                }
            }
        }
        var query = new Query_1.Query(this._pivot[0]).use(this);
        query.where(this._pivot[2], id1);
        if (this._pivot[3])
            query.where(this._pivot[3], this._pivot[4]);
        return query.all().then(function (data) {
            var exists = [], deletes = [], inserts = [], updates = [], _data = {};
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var single = data_1[_i];
                var id = single[_this._pivot[1]];
                exists.push(id);
                _data[id] = single;
                if (ids.indexOf(id) === -1) {
                    deletes.push(id);
                }
            }
            for (var _a = 0, ids_1 = ids; _a < ids_1.length; _a++) {
                var id = ids_1[_a];
                if (exists.indexOf(id) === -1) {
                    inserts.push(id);
                }
                else if (notArray) {
                    for (var i in models[id]) {
                        if (_data[id][i] !== undefined &&
                            _data[id][i] != models[id][i]) {
                            updates.push(id);
                            break;
                        }
                    }
                }
            }
            var _query = new Query_1.Query(_this._pivot[0]).use(_this);
            var doInsert = function (query) {
                var id = inserts.shift(), data = notArray ? models[id] : {};
                data[_this._pivot[2]] = id1;
                data[_this._pivot[1]] = id;
                if (_this._pivot[3])
                    data[_this._pivot[3]] = _this._pivot[4];
                return query.insert(data).then(function (query) {
                    return inserts.length ? doInsert(query) : query;
                });
            };
            var doUpdate = function (query) {
                var id = updates.shift(), data = notArray ? models[id] : {};
                query["_where"] = "";
                query["_bindings"] = [];
                query.where(_this._pivot[1], _data[id][_this._pivot[1]])
                    .where(_this._pivot[2], id1);
                delete data[_this._pivot[2]];
                delete data[_this._pivot[1]];
                if (_this._pivot[3]) {
                    query.where(_this._pivot[3], _this._pivot[4]);
                    delete data[_this._pivot[3]];
                }
                return query.update(data).then(function (query) {
                    return updates.length ? doUpdate(query) : query;
                });
            };
            if (deletes.length || updates.length || inserts.length) {
                return _this.transaction(function () {
                    if (deletes.length) {
                        _query.whereIn(_this._pivot[1], deletes)
                            .where(_this._pivot[2], id1);
                        if (_this._pivot[3])
                            _query.where(_this._pivot[3], _this._pivot[4]);
                        return _query.delete().then(function (_query) {
                            return updates.length ? doUpdate(_query) : _query;
                        }).then(function (_query) {
                            return inserts.length ? doInsert(_query) : _query;
                        });
                    }
                    else if (updates.length) {
                        return doUpdate(_query).then(function (_query) {
                            return inserts.length ? doInsert(_query) : _query;
                        });
                    }
                    else if (inserts.length) {
                        return doInsert(_query);
                    }
                }).then(function () { return target; });
            }
            else {
                return target;
            }
        });
    };
    Model.prototype.detach = function (models) {
        if (models === void 0) { models = []; }
        if (!(models instanceof Array)) {
            throw new TypeError("The only argument passed to Model.detach()"
                + " must be an array.");
        }
        if (!(this._caller instanceof Model)) {
            throw new SyntaxError("Model.attach() can only be called after "
                + "calling Model.hasVia() or Model.belongsToVia().");
        }
        var target = this._caller, id1 = target.data[target.primary], query = new Query_1.Query(this._pivot[0]).use(this);
        query.where(this._pivot[2], id1);
        if (this._pivot[3])
            query.where(this._pivot[3], this._pivot[4]);
        if (models.length > 0) {
            var ids = [];
            for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
                var model = models_2[_i];
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
        return query.delete().then(function () { return target; });
    };
    Model.oldIterator = false;
    return Model;
}(Query_1.Query));
exports.Model = Model;
Object.defineProperties(Model.prototype, {
    _extra: {
        get: function () {
            return this.extra;
        },
        set: function (v) {
            this.extra = v;
        }
    }
});
//# sourceMappingURL=Model.js.map