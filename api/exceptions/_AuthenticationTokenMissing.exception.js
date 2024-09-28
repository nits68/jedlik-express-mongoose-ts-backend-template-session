"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class AuthenticationTokenMissingException extends _Http_exception_1.default {
    constructor() {
        super(401, "Authentication token missing");
    }
}
exports.default = AuthenticationTokenMissingException;
//# sourceMappingURL=_AuthenticationTokenMissing.exception.js.map