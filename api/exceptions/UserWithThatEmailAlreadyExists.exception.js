"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("./Http.exception"));
class UserWithThatEmailAlreadyExistsException extends Http_exception_1.default {
    constructor(email) {
        super(400, `User with email ${email} already exists`);
    }
}
exports.default = UserWithThatEmailAlreadyExistsException;
//# sourceMappingURL=UserWithThatEmailAlreadyExists.exception.js.map