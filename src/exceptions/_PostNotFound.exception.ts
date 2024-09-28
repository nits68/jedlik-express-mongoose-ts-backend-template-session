import HttpException from "./_Http.exception";
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

export default class PostNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Post with id ${id} not found`);
    }
}
