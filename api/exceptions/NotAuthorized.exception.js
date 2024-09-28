"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("./Http.exception"));
class NotAuthorizedException extends Http_exception_1.default {
    constructor() {
        super(403, "You're not authorized");
    }
}
exports.default = NotAuthorizedException;
//# sourceMappingURL=NotAuthorized.exception.js.map