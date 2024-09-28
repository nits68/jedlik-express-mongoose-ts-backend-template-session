"use strict";
/**
 * @openapi
 * components:
 *  schemas:
 *   Error:
 *     type: object
 *     properties:
 *      status:
 *        type: number
 *        description: 'A hiba kódja'
 *        example: 401
 *      message:
 *        type: string
 *        description: 'A hibaüzenet (hiba leírása)'
 *        example: 'Wrong authentication token'
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    status;
    message;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.default = HttpException;
//# sourceMappingURL=Http.exception.js.map
