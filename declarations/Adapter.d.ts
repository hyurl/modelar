/// <reference types="node" />
import { EventEmitter } from "events";
import { DB } from "./DB";
import { Table } from "./Table";
import { Query } from "./Query";
export declare abstract class Adapter extends EventEmitter {
    connection: any;
    quote: string;
    backquote: string | string[];
    create?: (table: Table) => Promise<Table>;
    drop?: (table: Table) => Promise<Table>;
    random?: (query: Query) => Query;
    limit?: (query: Query, length: number, offset?: number) => Query;
    chunk?: (query: Query, length: number, cb: (data: any[]) => false | void) => Promise<any[]>;
    paginate?: (query: Query, page: number, length?: number) => Promise<{
        page: number;
        limit: number;
        pages: number;
        total: number;
        data: any[];
    }>;
    getSelectSQL?: (query: Query) => string;
    abstract connect(db: DB): Promise<DB>;
    abstract query(db: DB, sql: string, bindings?: any[]): Promise<DB>;
    abstract release(): void;
    abstract close(): void;
    abstract closeAll(): void;
    abstract getDDL(table: Table): string;
    transaction(db: DB, cb: (db: DB) => void): Promise<DB>;
    commit(db: DB): Promise<DB>;
    rollback(db: DB): Promise<DB>;
}
