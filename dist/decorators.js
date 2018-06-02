"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
var assign = require("lodash/assign");
function prepare(proto, prop) {
    if (!proto.hasOwnProperty("schema")) {
        proto.schema = proto.schema ? assign({}, proto.schema) : {};
        proto.fields = proto.fields ? [].concat(proto.fields) : [];
    }
    if (proto.schema[prop] === undefined)
        proto.schema[prop] = assign({}, interfaces_1.FieldConfig, { name: prop });
}
function field() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (typeof args[0] === "object") {
        var proto = args[0], prop = args[1];
        prepare(proto, prop);
        if (proto.fields.indexOf(prop) === -1)
            proto.fields.push(prop);
    }
    else {
        var type_1 = args[0], length_1 = args[1] | 0;
        return function (proto, prop) {
            field(proto, prop);
            proto.schema[prop].type = type_1;
            proto.schema[prop].length = length_1;
        };
    }
}
exports.field = field;
function primary(proto, prop) {
    prepare(proto, prop);
    proto.primary = prop;
    proto.schema[prop].primary = true;
}
exports.primary = primary;
function searchable(proto, prop) {
    if (!proto.hasOwnProperty("searchable"))
        proto.searchable = proto.searchable ? [].concat(proto.searchable) : [];
    if (proto.searchable.indexOf(prop) === -1) {
        proto.searchable.push(prop);
    }
}
exports.searchable = searchable;
function autoIncrement() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (typeof args[0] === "object") {
        var proto = args[0], prop = args[1];
        prepare(proto, prop);
        proto.schema[prop].autoIncrement = [1, 1];
    }
    else {
        var start_1 = args[0], step_1 = args[1] || 1;
        return function (proto, prop) {
            prepare(proto, prop);
            proto.schema[prop].autoIncrement = [start_1, step_1];
        };
    }
}
exports.autoIncrement = autoIncrement;
function unique(proto, prop) {
    prepare(proto, prop);
    proto.schema[prop].unique = true;
}
exports.unique = unique;
function defaultValue(value) {
    return function (proto, prop) {
        prepare(proto, prop);
        proto.schema[prop].default = value;
    };
}
exports.defaultValue = defaultValue;
function notNull(proto, prop) {
    prepare(proto, prop);
    proto.schema[prop].notNull = true;
}
exports.notNull = notNull;
function unsigned(proto, prop) {
    prepare(proto, prop);
    proto.schema[prop].unsigned = true;
}
exports.unsigned = unsigned;
function comment(text) {
    return function (proto, prop) {
        prepare(proto, prop);
        proto.schema[prop].comment = text;
    };
}
exports.comment = comment;
function foreignKey(input, field, onDelete, onUpdate) {
    if (onDelete === void 0) { onDelete = "set null"; }
    if (onUpdate === void 0) { onUpdate = "no action"; }
    var foreignKey;
    if (typeof input === "object") {
        foreignKey = input;
    }
    else {
        foreignKey = { table: input, field: field, onDelete: onDelete, onUpdate: onUpdate };
    }
    return function (proto, prop) {
        proto.schema[prop].foreignKey = assign({}, proto.schema[prop].foreignKey, foreignKey);
    };
}
exports.foreignKey = foreignKey;
//# sourceMappingURL=decorators.js.map