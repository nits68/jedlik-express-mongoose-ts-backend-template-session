"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class WrongCredentialsException extends _Http_exception_1.default {
    constructor() {
        super(401, "Wrong credentials provided");
    }
}
exports.default = WrongCredentialsException;
//# sourceMappingURL=_WrongCredentials.exception.js.map