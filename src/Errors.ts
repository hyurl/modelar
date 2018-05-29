import { __extends } from "tslib";
import assign = require("lodash/assign");
const inspect: string | symbol = require("util").inspect.custom || "inspect";

// In ES5, class inheritance of Error won't get the correct name and 
// constructor, so here I define a function instead, inside the function body,
// setting error name, message and stack manually, thus compatible to both ES5
// and ES6.
const CustomError: typeof Error = <any>function (message: string) {
    var err: Error = Error.call(this, message);
    this.name = this.constructor.name;
    this.message = err.message;
    var stacks = err.stack.split("\n");
    stacks[0] = this.name + ": " + this.message;
    stacks.splice(1, 2);
    this.stack = stacks.join("\n");
};

CustomError.prototype[inspect] = function () {
    return this.stack;
};

__extends(CustomError, Error);

export class UpdateError extends CustomError { }

export class InsertionError extends CustomError { }

export class DeletionError extends CustomError { }

export class NotFoundError extends CustomError {}