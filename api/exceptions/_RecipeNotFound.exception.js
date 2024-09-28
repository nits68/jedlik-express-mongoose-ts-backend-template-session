"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
class RecipeNotFoundException extends _Http_exception_1.default {
    constructor(id) {
        super(404, `Recipe with id ${id} not found`);
    }
}
exports.default = RecipeNotFoundException;
//# sourceMappingURL=_RecipeNotFound.exception.js.map