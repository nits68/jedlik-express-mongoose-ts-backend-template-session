"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class UserNotFoundException extends _Http_exception_1.default {
    constructor(id) {
        super(404, `User with id ${id} not found`);
    }
}
exports.default = UserNotFoundException;
//# sourceMappingURL=_UserNotFound.exception.js.map