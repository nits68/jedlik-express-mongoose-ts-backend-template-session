"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class UserWithThatEmailAlreadyExistsException extends _Http_exception_1.default {
    constructor(email) {
        super(400, `User with email ${email} already exists`);
    }
}
exports.default = UserWithThatEmailAlreadyExistsException;
//# sourceMappingURL=_UserWithThatEmailAlreadyExists.exception.js.map