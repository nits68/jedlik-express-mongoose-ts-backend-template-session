"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class WrongAuthenticationTokenException extends _Http_exception_1.default {
    constructor() {
        super(401, "Wrong authentication token");
    }
}
exports.default = WrongAuthenticationTokenException;
//# sourceMappingURL=_WrongAuthenticationToken.exception.js.map