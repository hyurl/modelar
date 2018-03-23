"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
function prepare(proto, prop) {
    if (!proto.hasOwnProperty("schema")) {
        proto.schema = Object.assign({}, proto.schema);
        proto.fields = Object.assign([], proto.fields);
    }
    if (proto.schema[prop] === undefined)
        proto.schema[prop] = Object.assign({}, interfaces_1.FieldConfig, { name: prop });
}
function field(...args) {
    if (typeof args[0] === "object") {
        let proto = args[0], prop = args[1];
        prepare(proto, prop);
        if (!proto.fields.includes(prop))
            proto.fields.push(prop);
    }
    else {
        let type = args[0], length = args[1] | 0;
        return (proto, prop) => {
            field(proto, prop);
            proto.schema[prop].type = type;
            proto.schema[prop].length = length;
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
        proto.searchable = Object.assign([], proto.searchable);
    if (!proto.searchable.includes(prop)) {
        proto.searchable.push(prop);
    }
}
exports.searchable = searchable;
function autoIncrement(...args) {
    if (typeof args[0] === "object") {
        let proto = args[0], prop = args[1];
        prepare(proto, prop);
        proto.schema[prop].autoIncrement = [1, 1];
    }
    else {
        let start = args[0], step = args[1] || 1;
        return (proto, prop) => {
            prepare(proto, prop);
            proto.schema[prop].autoIncrement = [start, step];
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
    return (proto, prop) => {
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
    return (proto, prop) => {
        prepare(proto, prop);
        proto.schema[prop].comment = text;
    };
}
exports.comment = comment;
function foreignKey(input, field, onDelete = "set null", onUpdate = "no action") {
    var foreignKey;
    if (typeof input === "object") {
        foreignKey = input;
    }
    else {
        foreignKey = { table: input, field, onDelete, onUpdate };
    }
    return (proto, prop) => {
        proto.schema[prop].foreignKey = Object.assign(proto.schema[prop].foreignKey, foreignKey);
    };
}
exports.foreignKey = foreignKey;
//# sourceMappingURL=decorators.js.map