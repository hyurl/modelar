const Model = require("./Model");
const bcrypt = require("bcrypt-nodejs");

/**
 * *User Model.*
 * 
 * This model is used to manage user data, it provides a login() method that 
 * allows you sign in the website.
 */
class User extends Model {
    /**
     *  Creates a new User instance with initial data and configurations.
     * 
     * @param  {object}  [data]  Initial data of the model.
     * 
     * @param  {object}  [config]  Initial configuration of the model, they 
     *  could be:
     *  * `table` The table name that the instance binds to.
     *  * `fields` Fields of the table in an array.
     *  * `primary` The primary key of the table.
     *  * `searchable` An array that carries all searchable fields, they could
     *      be used when calling `user.getMany()`.
     */
    constructor(data = {}, config = {}) {
        super(data, Object.assign({
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        }, config));

        // This property defines which fields can be used for logging-in.
        this._loginable = ["name", "email"];

        // When creating a new user, if no password is provided, use an empty
        // string as its password.
        this.on("save", () => {
            if (this._data.password === undefined)
                this.password = "";
        });
    }

    // The setter of password, use BCrypt to encrypt data.
    set password(v) {
        // Model's data are stored in the _data property.
        this._data.password = bcrypt.hashSync(v);
    }

    // The getter of password, always return undefined.
    // When a getter returns undefined, that means when you call toString() or
    // valueOf(), or in a for...of... loop, this property will be absent.
    get password() {
        return undefined;
    }

    /**
     * Trying to sign in a user. If succeeded, an `login` event will be fired, 
     * if failed, throws an error indicates the reason. This method won't 
     * save user information in session or other storage materials, if you 
     * want it to, you have to do it yourself.
     * 
     * @param  {object}  args  This parameter can carry one or more 
     *  `loginable` fields and values, and a `password` field must be passed 
     *  at the same time. If no `loginable` fields are passed, a `user` must 
     *  be passed, which means trying to match all possibilities 
     *  automatically.
     * 
     * @return {Promise<this>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the user instance logged in.
     */
    login(args) {
        if (args.password === undefined) {
            return new Promise(() => {
                throw new Error("Logging in requires a `password`, " +
                    "but none given.");
            });
        }
        var _args = {};
        if (args.user === undefined) {
            // Use a specified field for logging-in.
            for (let k in args) {
                if (this._loginable.includes(k)) {
                    _args[k] = args[k];
                }
            }
            if (Object.keys(_args).length === 0) {
                return new Promise(() => {
                    throw new Error("Logging in requires at least one " +
                        "loginable field, but none given.");
                });
            }
            this.where(_args);
        } else {
            // Try to match all loginable fields.
            for (let field of this._loginable) {
                this.orWhere(field, args.user);
            }
        }

        return this.all().then(users => { // Get all matched users.
            for (let user of users) {
                // Try to match password for every user, until the first one 
                // matched.
                let password = user._data.password || "";
                try {
                    if (bcrypt.compareSync(args.password, password)) {
                        this._data = user._data
                        this.emit("login", this); // Fire login event.
                        return this;
                    }
                } catch (err) {
                    throw err instanceof Error ? err : new Error(err);
                }
            }
            throw new Error("The password you provided didn't match any " +
                this.constructor.name + ".");
        });
    }

    /**
     * Tring to sign in a user. If succeeded, an `login` event will be fired, 
     * if failed, throws an error indicates the reason. This method won't 
     * save user information in session or other storage materials, if you 
     * want it to, you have to do it yourself.
     * 
     * @param  {object}  args  This parameter can carry one or more 
     *  `loginable` fields and values, and a `password` field must be passed 
     *  at the same time. If no `loginable` fields are passed, a `user` must 
     *  be passed, which means trying to match all possibilities 
     *  automatically.
     * 
     * @return {Promise<User>} Returns a Promise, and the the only argument 
     *  passed to the callback of `then()` is the user instance logged in.
     */
    static login(args) {
        return (new this()).login(args);
    }
}

module.exports = User;