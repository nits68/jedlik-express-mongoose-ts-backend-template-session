"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _Http_exception_1 = tslib_1.__importDefault(require("./_Http.exception"));
/**
 * @openapi
 * components:
 *  schemas:
 *   PostNotFoundException:
 *     type: object
 *     properties:
 *      status:
 *        type: number
 *        description: 'A hiba kódja'
 *        example: 404
 *      message:
 *        type: string
 *        description: 'A hibaüzenet (hiba leírása)'
 *        example: 'Post with id c77777777777777777777778 not found'
 *
 */
class PostNotFoundException extends _Http_exception_1.default {
    constructor(id) {
        super(404, `Post with id ${id} not found`);
    }
}
exports.default = PostNotFoundException;
//# sourceMappingURL=_PostNotFound.exception.js.map