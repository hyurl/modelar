"use strict";

const Model = require('./Model');
const bcrypt = require('bcrypt-nodejs');

/**
 * *User Model.*
 * 
 * This model is used to manage user data, it provides a login() method that 
 * allows you sign in the website.
 */
class User extends Model {
    constructor(data = {}, config = {}) {
        super(data, Object.assign({
            table: 'users',
            primary: 'id',
            fields: [
                'id',
                'name',
                'email',
                'password',
            ],
            searchable: [
                'name',
                'email',
            ]
        }, config));

        //This property defines which fields can be used for logging-in.
        this.__loginable = [
            'name',
            'email',
        ];

        this.__events = Object.assign({
            query: [],
            insert: [],
            inserted: [],
            update: [],
            updated: [],
            save: [],
            saved: [],
            delete: [],
            deleted: [],
            get: [],
            //This event will be fired when the user successfully logged in.
            login: [],
        }, this.constructor.__events);

        //When creating a new user, if no password is provided, use an empty
        //string as its password.
        this.on('save', () => {
            if (this.__data.password === undefined)
                this.password = "";
        });
    }

    //The setter of password, use BCrypt to encrypt data.
    set password(v) {
        //Model's data are stored in the __data property.
        this.__data.password = bcrypt.hashSync(v);
    }

    //The getter of password, always return undefined.
    //When a getter returns undefined, that means when you call toString() or
    //valueOf(), or in a for...of... loop, this property will be absent.
    get password() {
        return undefined;
    }

    /**
     * Tries to sign in a user. If succeeded, an `login` event will be fired, 
     * if failed, throws an error indicates the reason. This method won't 
     * save user information in session or other storage materials, if you 
     * want it to, you have to do it yourself.
     * 
     * @param {Object} args This parameter can carry one or more `loginable` 
     *                      fields and values, and a `password` field must be 
     *                      passed at the same time. If no `loginable` fields 
     *                      are passed, a `user` must be passed, which means 
     *                      trying to match all possibilities automatically.
     * 
     * @return (Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the user instance 
     *                   which is logged in.
     */
    login(args) {
        if (args.password === undefined) {
            return new Promise(() => {
                throw new Error("Login requires a `password`, " +
                    "but none given.");
            });
        }
        var _args = {};
        if (args.user === undefined) { //Use a specified field for logging-in.
            for (var k in args) {
                if (this.__loginable.includes(k)) {
                    _args[k] = args[k];
                }
            }
            if (Object.keys(_args).length === 0) {
                return new Promise(() => {
                    throw new Error("Login requires at least one loginable " +
                        "field, but none given.");
                });
            }
            this.where(_args); //使用 where 查询
        } else { //Try to match all loginable fields.
            for (var field of this.__loginable) {
                this.orWhere(field, args.user);
            }
        }

        return this.all().then(users => { //Get all matched users.
            if (users.length === 0) {
                throw new Error(this.constructor.name +
                    " was not found by searching " +
                    "the given data.");
            }
            for (var _user of users) {
                //Try to match password for every user, until the first one 
                //matched.
                var password = _user.__data.password;
                if (bcrypt.compareSync(args.password, password)) {
                    this.__data = _user.__data
                    this.trigger('login', this); //Fire login event.
                    return this;
                }
            }
            throw new Error("The password you provided didn't match any " +
                this.constructor.name + ".");
        });
    }

    static login(args) {
        return (new this()).login(args);
    }
}

module.exports = User;