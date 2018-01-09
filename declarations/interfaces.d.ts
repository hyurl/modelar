export interface DBConfig {
    type?: string;
    database: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    ssl?: {
        rejectUnauthorized?: boolean;
        ca?: string;
        key?: string;
        cert?: string;
    };
    timeout?: number;
    charset?: string;
    /** Maximum connection count of the pool. */
    max?: number;
}
export interface ModelConfig {
    /** The table that the model binds to. */
    table: string;
    /** Fields in the model's table */
    fields: string[];
    /** Primary key of the model's table. */
    primary: string;
    /** Searchable fields in the model's table. */
    searchable?: string[];
}
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
export interface FieldConfig {
    name: string;
    type?: string;
    length?: number | number[];
    primary?: boolean;
    autoIncrement?: boolean | number[];
    unique?: boolean;
    default?: any;
    unsigned?: boolean;
    comment?: string;
    notNull?: boolean;
    foreignKey?: ForeignKeyConfig;
}
