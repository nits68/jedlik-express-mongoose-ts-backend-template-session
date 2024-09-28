"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("./Http.exception"));
class WrongAuthenticationTokenException extends Http_exception_1.default {
    constructor() {
        super(401, "Wrong authentication token");
    }
}
exports.default = WrongAuthenticationTokenException;
//# sourceMappingURL=WrongAuthenticationToken.exception.js.map