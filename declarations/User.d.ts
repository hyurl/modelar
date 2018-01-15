import { Model } from "./Model";
import { ModelConfig } from "./interfaces";
export declare class User extends Model {
    id: number;
    name: string;
    email: string;
    protected _loginable: string[];
    constructor();
    constructor(data: {
        [field: string]: any;
    });
    /**  Creates a new instance with initial data and model configurations. */
    constructor(data: {
        [field: string]: any;
    }, config: ModelConfig);
    /** Sets the password for the current user. */
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
    static login(options: {
        [field: string]: string;
        user?: string;
        password: string;
    }): Promise<User>;
}
