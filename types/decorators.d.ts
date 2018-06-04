import { ForeignKeyConfig } from "./interfaces";
import { Model } from "./Model";
export declare type ModelDecorator = (proto: Model, prop: string) => void;
export declare function field(type: string, length?: number | [number, number]): ModelDecorator;
export declare function field(proto: Model, prop: string): void;
export declare function primary(proto: Model, prop: string): void;
export declare function searchable(proto: Model, prop: string): void;
export declare type TableDecorator = (proto: Model, prop: string) => void;
export declare function autoIncrement(start: number, step?: number): TableDecorator;
export declare function autoIncrement(proto: Model, prop: string): void;
export declare function unique(proto: Model, prop: string): void;
export declare function defaultValue(value: string | number | boolean | void | Date): TableDecorator;
export declare function notNull(proto: Model, prop: string): void;
export declare function unsigned(proto: Model, prop: string): void;
export declare function comment(text: string): TableDecorator;
export declare function foreignKey(config: ForeignKeyConfig): TableDecorator;
export declare function foreignKey(table: string, field: string, onDelete?: ForeignKeyConfig["onDelete"], onUpdate?: ForeignKeyConfig["onUpdate"]): Function;