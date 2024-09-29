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

export default class HttpException extends Error {
    public status: number;
    public message: string;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
