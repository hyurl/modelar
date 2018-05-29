import { FieldConfig, ForeignKeyConfig } from "./interfaces";
import { Model } from "./Model";
import assign = require("lodash/assign");

function prepare(proto: Model, prop: string) {
    if (!proto.hasOwnProperty("schema")) {
        proto.schema = assign({}, proto.schema);
        proto.fields = [].concat(proto.fields);
    }

    if (proto.schema[prop] === undefined)
        proto.schema[prop] = assign({}, FieldConfig, { name: prop });
}

export type ModelDecorator = (proto: Model, prop: string) => void;

export function field(type: string, length?: number | [number, number]): ModelDecorator;
export function field(proto: Model, prop: string): void;
export function field(...args) {
    if (typeof args[0] === "object") {
        let proto: Model = args[0],
            prop: string = args[1];

        prepare(proto, prop);

        if (proto.fields.indexOf(prop) === -1)
            proto.fields.push(prop);
    } else {
        let type: string = args[0],
            length: number | [number, number] = args[1] | 0;

        return (proto: Model, prop: string) => {
            field(proto, prop);
            proto.schema[prop].type = type;
            proto.schema[prop].length = length;
        }
    }
}

export function primary(proto: Model, prop: string) {
    prepare(proto, prop);
    proto.primary = prop;
    proto.schema[prop].primary = true;
}

export function searchable(proto: Model, prop: string) {
    if (!proto.hasOwnProperty("searchable"))
        proto.searchable = [].concat(proto.searchable);

    if (proto.searchable.indexOf(prop) === -1) {
        proto.searchable.push(prop);
    }
}

export type TableDecorator = (proto: Model, prop: string) => void;

export function autoIncrement(start: number, step?: number): TableDecorator;
export function autoIncrement(proto: Model, prop: string): void;
export function autoIncrement(...args) {
    if (typeof args[0] === "object") {
        let proto: Model = args[0],
            prop: string = args[1];

        prepare(proto, prop);
        proto.schema[prop].autoIncrement = [1, 1];
    } else {
        let start: number = args[0],
            step: number = args[1] || 1;

        return (proto: Model, prop: string) => {
            prepare(proto, prop);
            proto.schema[prop].autoIncrement = [start, step];
        }
    }
}

export function unique(proto: Model, prop: string) {
    prepare(proto, prop);
    proto.schema[prop].unique = true;
}

export function defaultValue(value: string | number | boolean | void | Date): TableDecorator {
    return (proto: Model, prop: string) => {
        prepare(proto, prop);
        proto.schema[prop].default = value;
    }
}

export function notNull(proto: Model, prop: string) {
    prepare(proto, prop);
    proto.schema[prop].notNull = true;
}

export function unsigned(proto: Model, prop: string) {
    prepare(proto, prop);
    proto.schema[prop].unsigned = true;
}

export function comment(text: string): TableDecorator {
    return (proto: Model, prop: string) => {
        prepare(proto, prop);
        proto.schema[prop].comment = text;
    }
}

export function foreignKey(config: ForeignKeyConfig): TableDecorator;
export function foreignKey(
    table: string,
    field: string,
    onDelete?: "no action" | "set null" | "cascade" | "restrict",
    onUpdate?: "no action" | "set null" | "cascade" | "restrict"
): Function;
export function foreignKey(input, field?: string, onDelete = "set null", onUpdate = "no action") {
    var foreignKey: ForeignKeyConfig;
    if (typeof input === "object") {
        foreignKey = input;
    } else {
        foreignKey = <ForeignKeyConfig>{ table: input, field, onDelete, onUpdate };
    }
    return (proto: Model, prop: string) => {
        proto.schema[prop].foreignKey = assign(
            {},
            proto.schema[prop].foreignKey,
            foreignKey
        );
    }
}