"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var tslib_2 = require("tslib");
var inspect = require("util").inspect.custom || "inspect";
var CustomError = function (message) {
    var err = Error.call(this, message);
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
tslib_2.__extends(CustomError, Error);
var UpdateError = (function (_super) {
    tslib_1.__extends(UpdateError, _super);
    function UpdateError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UpdateError;
}(CustomError));
exports.UpdateError = UpdateError;
var InsertionError = (function (_super) {
    tslib_1.__extends(InsertionError, _super);
    function InsertionError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InsertionError;
}(CustomError));
exports.InsertionError = InsertionError;
var DeletionError = (function (_super) {
    tslib_1.__extends(DeletionError, _super);
    function DeletionError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DeletionError;
}(CustomError));
exports.DeletionError = DeletionError;
var NotFoundError = (function (_super) {
    tslib_1.__extends(NotFoundError, _super);
    function NotFoundError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotFoundError;
}(CustomError));
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=Errors.js.map