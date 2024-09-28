"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class SessionExpiredException extends _Http_exception_1.default {
    constructor() {
        super(401, "Session id missing or session has expired, please log in!");
    }
}
exports.default = SessionExpiredException;
//# sourceMappingURL=_SessionExpired.exception.js.map