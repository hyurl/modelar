import { Model } from "./Model";
export interface DBConfig {
    [x: string]: any;
    type?: string;
    database: string;
    /** socket, TCP, TCPIP (default), pipe, UNIX (UNIX socket), memory, etc. */
    protocol?: string;
    host?: string;
    port?: number;
    /** The path to a UNIX domain socket (if supported), when `host` and `port` are missing. */
    socketPath?: string;
    user?: string;
    password?: string;
    ssl?: string | {
        [x: string]: any;
        rejectUnauthorized?: boolean;
        ca?: string;
        key?: string;
        cert?: string;
    };
    timeout?: number;
    charset?: string;
    /** Maximum connection count of the pool. */
    max?: number;
    /**
     * Customize connection string when necessary, be aware different adapters
     * support different string formats.
     */
    connectionString?: string;
}
export declare const DBConfig: DBConfig;
export interface ForeignKeyConfig {
    /** The name of the foreign table. */
    table: string;
    /** The binding field in the foreign table. */
    field: string;
    /** An action will be triggered when the record is deleted. */
    onDelete?: "no action" | "set null" | "cascade" | "restrict";
    /** An action will be triggered when the record is update. */
    onUpdate?: "no action" | "set null" | "cascade" | "restrict";
}
export declare const ForeignKeyConfig: ForeignKeyConfig;
export interface FieldConfig {
    name: string;
    type?: string;
    length?: number | [number, number];
    primary?: boolean;
    autoIncrement?: false | [number, number];
    unique?: boolean;
    default?: any;
    unsigned?: boolean;
    comment?: string;
    notNull?: boolean;
    foreignKey?: ForeignKeyConfig;
}
export declare const FieldConfig: FieldConfig;
export interface ModelConfig {
    /** The table that the model binds to. */
    table: string;
    /** Fields in the model's table. */
    fields: string[];
    /** Primary key of the model's table. */
    primary: string;
    /** Searchable fields in the model's table. */
    searchable?: string[];
}
export declare const ModelConfig: ModelConfig;
export interface PaginatedRecords {
    /** The current page. */
    page: number;
    /** A number of all record pages. */
    pages: number;
    /** The top limit of per page. */
    limit: number;
    /** A number of all record counts. */
    total: number;
    data: any[];
}
export interface PaginatedModels extends PaginatedRecords {
    orderBy?: string;
    sequence?: "asc" | "desc" | "rand";
    /** Used for vague searching. */
    keywords?: string | string[];
    data: Model[];
}
export interface ModelGetManyOptions {
    /** Default `1`. */
    page?: number;
    /** Default `10` */
    limit?: number;
    /** Default `model.primary` */
    orderBy?: string;
    /** Default `asc`. */
    sequence?: "asc" | "desc" | "rand";
    /** Used for vague searching. */
    keywords?: string | string[];
    [field: string]: any;
}
export declare const ModelGetManyOptions: ModelGetManyOptions;
