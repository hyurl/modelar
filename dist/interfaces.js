"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBConfig = {
    type: "mysql",
    database: "",
    protocol: "TCPIP",
    host: "",
    port: 0,
    user: "",
    password: "",
    ssl: null,
    timeout: 5000,
    charset: "utf8",
    max: 50,
    connectionString: "",
};
exports.ForeignKeyConfig = {
    table: "",
    field: "",
    onDelete: "set null",
    onUpdate: "no action"
};
exports.FieldConfig = {
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
    foreignKey: null,
};
exports.ModelConfig = {
    table: "",
    fields: null,
    primary: "",
    searchable: null
};
exports.ModelGetManyOptions = {
    page: 1,
    limit: 10,
    orderBy: "id",
    sequence: "asc",
    keywords: ""
};
//# sourceMappingURL=interfaces.js.map