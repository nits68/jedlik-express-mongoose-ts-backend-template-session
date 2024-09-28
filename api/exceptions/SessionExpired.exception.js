"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("./Http.exception"));
class SessionExpiredException extends Http_exception_1.default {
    constructor() {
        super(401, "Session id missing or session has expired, please log in!");
    }
}
exports.default = SessionExpiredException;
//# sourceMappingURL=SessionExpired.exception.js.map