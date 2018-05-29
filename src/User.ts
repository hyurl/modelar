import { Model } from "./Model";
import { ModelConfig } from "./interfaces";
import { field, primary, searchable, autoIncrement } from "./decorators";
import * as bcrypt from "bcrypt-nodejs";
import { NotFoundError } from './Errors';

export class User extends Model {
    table = "users";

    @field
    @primary
    @autoIncrement
    readonly id: number;

    @field("varchar", 32)
    @searchable
    name: string;

    @field("varchar", 32)
    @searchable
    email: string;

    static loginable: string[] = ["name", "email"];

    constructor(data?: { [field: string]: any });

    /**  Creates a new instance with initial data and model configurations. */
    constructor(data: { [field: string]: any }, config: ModelConfig);

    constructor(data?: { [field: string]: any }, config?: ModelConfig) {
        super(data, config);
        this.on("save", () => {
            if (this.data.password === undefined)
                this.password = "";
        });
    }

    /** The password for the current user. */
    @field("varchar", 64)
    set password(v: string) {
        this.data.password = <string>bcrypt.hashSync(v);

        if (!this.isNew) {
            this["_modified"].password = this.data.password;
        }
    }

    get password(): string {
        // When a getter returns undefined, that means when you call 
        // `model.toString()` or `mode.valueOf()`, or in a `for...of...` loop,
        // this property will be absent.
        return undefined;
    }

    /**
     * Trying to sign in a user.
     * 
     * If succeeded, an `login` event will be fired, if failed, throws an 
     * error indicates the reason. This method won't save user information in 
     * session or other storage materials, if you want it to, you have to do 
     * it yourself.
     */
    login(options: {
        [field: string]: string,
        user?: string,
        password: string
    }): Promise<this> {
        let Class = <typeof User>this.constructor;

        if (options.password === undefined) {
            return Promise.reject(
                new TypeError(`The argument passed to ${Class["name"]}.login() `
                    + `must contain a 'password' property.`)
            );
        }

        let _options = {};
        if (options.user === undefined) {
            // Use a specified field for logging-in.
            for (let k in options) {
                if (Class.loginable.indexOf(k) >= 0) {
                    _options[k] = options[k];
                }
            }

            if (Object.keys(_options).length === 0) {
                return Promise.reject(
                    new TypeError(`The argument passed to ${Class["name"]}.login() `
                        + `must contain at least one login-able field.`)
                );
            }
            this.where(_options);
        } else {
            // Try to match all login-able fields.
            for (let field of Class.loginable) {
                this.orWhere(field, options.user);
            }
        }

        return this.all().then(users => { // Get all matched users.
            let i = -1;

            return new Promise((resolve: (user: this) => void, reject) => {
                let loop = () => {
                    i += 1;
                    let password = users[i].data.password || "";

                    bcrypt.compare(options.password, password, (err, pass) => {
                        if (err)
                            reject(err instanceof Error ? err : new Error(err));

                        if (pass) {
                            this.data = users[i].data
                            this.emit("login", this); // Fire login event.
                            resolve(this);
                        } else if (i < users.length - 1) {
                            loop();
                        } else {
                            reject(new NotFoundError("The password you " +
                                `provided didn't match any ${Class["name"]}.`));
                        }
                    });
                };

                loop();
            });
        });
    }


    static login(options: {
        [field: string]: string,
        user?: string,
        password: string
    }): Promise<User> {
        return (new this).login(options);
    }
}