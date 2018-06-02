import { Model } from "./Model";
import { ModelConfig } from "./interfaces";
export declare class User extends Model {
    table: string;
    readonly id: number;
    name: string;
    email: string;
    static loginable: string[];
    constructor(data?: {
        [field: string]: any;
    });
    /**  Creates a new instance with initial data and model configurations. */
    constructor(data: {
        [field: string]: any;
    }, config: ModelConfig);
    /** The password for the current user. */
    password: string;
    /**
     * Trying to sign in a user.
     *
     * If succeeded, an `login` event will be fired, if failed, throws an
     * error indicates the reason. This method won't save user information in
     * session or other storage materials, if you want it to, you have to do
     * it yourself.
     */
    login(options: {
        [field: string]: string;
        user?: string;
        password: string;
    }): Promise<this>;
    on(event: "query" | "save" | "saved" | "insert" | "inserted" | "update" | "updated" | "delete" | "deleted" | "get" | "login", listener: (thisObj: this) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    // static on(event: "query" | "save" | "saved" | "insert" | "inserted" | "update" | "updated" | "delete" | "deleted" | "get" | "login", listener: (user: User) => void): typeof User;
    // static on(event: string | symbol, listener: (...args: any[]) => void): typeof User;
    static login(options: {
        [field: string]: string;
        user?: string;
        password: string;
    }): Promise<User>;
}
