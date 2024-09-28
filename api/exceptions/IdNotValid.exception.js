"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("./Http.exception"));
class IdNotValidException extends Http_exception_1.default {
    constructor(id) {
        super(404, `This ${id} id is not valid.`);
    }
}
exports.default = IdNotValidException;
//# sourceMappingURL=IdNotValid.exception.js.map