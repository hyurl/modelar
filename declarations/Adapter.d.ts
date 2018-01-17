/// <reference types="node" />
import { DB } from "./DB";
import { Table } from "./Table";
import { Query } from "./Query";
export declare abstract class Adapter {
    connection: any;
    quote: string;
    backquote: string | [string, string];
    create?: (table: Table) => Promise<Table>;
    drop?: (table: Table) => Promise<Table>;
    random?: (query: Query) => Query;
    limit?: (query: Query, length: number, offset?: number) => Query;
    getSelectSQL?: (query: Query) => string;
    abstract connect(db: DB): Promise<DB>;
    abstract query(db: DB, sql: string, bindings?: any[]): Promise<DB>;
    abstract release(): void;
    abstract close(): void;
    abstract getDDL(table: Table): string;
    transaction(db: DB, cb: (db: DB) => Promise<any>): Promise<DB>;
    commit(db: DB): Promise<DB>;
    rollback(db: DB): Promise<DB>;
    static close(): void;
}
