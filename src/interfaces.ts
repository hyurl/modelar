import { Model } from "./Model";

export interface DBConfig {
    type?: string;
    database: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    ssl?: {
        rejectUnauthorized?: boolean,
        ca?: string,
        key?: string,
        cert?: string
    };
    timeout?: number;
    charset?: string;
    /** Maximum connection count of the pool. */
    max?: number
}

export const DBConfig: DBConfig = {
    type: "mysql",
    database: "",
    host: "",
    port: 0,
    user: "",
    password: "",
    ssl: null,
    timeout: 5000,
    charset: "utf8",
    max: 50,
};

export interface ForeignKeyConfig {
    /** The name of the foreign table. */
    table: string,
    /** The binding field in the foreign table. */
    field: string,
    /** An action will be triggered when the record is deleted. */
    onDelete?: "no action" | "set null" | "cascade" | "restrict",
    /** An action will be triggered when the record is update. */
    onUpdate?: "no action" | "set null" | "cascade" | "restrict"
}

export const ForeignKeyConfig: ForeignKeyConfig = {
    table: "",
    field: "",
    onDelete: "set null",
    onUpdate: "no action"
};

export interface FieldConfig {
    name: string;
    type?: string;
    length?: number | [number, number];
    primary?: boolean;
    autoIncrement?: boolean | [number, number];
    unique?: boolean;
    default?: any;
    unsigned?: boolean;
    comment?: string;
    notNull?: boolean;
    foreignKey?: ForeignKeyConfig;
}

export const FieldConfig: FieldConfig = {
    name: "",
    type: "",
    length: 0,
    notNull: false,
    default: undefined,
    primary: false,
    autoIncrement: false,
    unsigned: false,
    unique: false,
    comment: "",
    foreignKey: ForeignKeyConfig,
}

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

export const ModelConfig: ModelConfig = {
    table: "",
    fields: null,
    primary: "",
    searchable: null
};

export interface PaginatedRecords {
    /** The current page. */
    page: number;
    /** A number of all record pages. */
    pages: number;
    /** The top limit of per page. */
    limit: number;
    /** A number of all record counts. */
    total: number;
    data: any[]
}

export interface PaginatedModels extends PaginatedRecords {
    orderBy?: string,
    sequence?: "asc" | "desc" | "rand",
    /** Used for vague searching. */
    keywords?: string | string[]
    data: Model[]
}

export interface ModelGetManyOptions {
    /** Default `1`. */
    page?: number,
    /** Default `10` */
    limit?: number,
    /** Default `model.primary` */
    orderBy?: string,
    /** Default `asc`. */
    sequence?: "asc" | "desc" | "rand",
    /** Used for vague searching. */
    keywords?: string | string[],
    [field: string]: any
}

export const ModelGetManyOptions: ModelGetManyOptions = {
    page: 1,
    limit: 10,
    orderBy: "id",
    sequence: "asc",
    keywords: ""
};