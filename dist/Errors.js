"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var UpdateError = (function (_super) {
    tslib_1.__extends(UpdateError, _super);
    function UpdateError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UpdateError;
}(Error));
exports.UpdateError = UpdateError;
var InsertionError = (function (_super) {
    tslib_1.__extends(InsertionError, _super);
    function InsertionError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InsertionError;
}(Error));
exports.InsertionError = InsertionError;
var DeletionError = (function (_super) {
    tslib_1.__extends(DeletionError, _super);
    function DeletionError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DeletionError;
}(Error));
exports.DeletionError = DeletionError;
var NotFoundError = (function (_super) {
    tslib_1.__extends(NotFoundError, _super);
    function NotFoundError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotFoundError;
}(Error));
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=Errors.js.map