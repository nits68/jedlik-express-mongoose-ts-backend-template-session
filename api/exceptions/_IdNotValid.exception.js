"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class IdNotValidException extends _Http_exception_1.default {
    constructor(id) {
        super(404, `This ${id} id is not valid.`);
    }
}
exports.default = IdNotValidException;
//# sourceMappingURL=_IdNotValid.exception.js.map