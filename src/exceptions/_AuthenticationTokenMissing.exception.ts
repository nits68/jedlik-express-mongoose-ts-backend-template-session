import HttpException from "./_Http.exception";
export default class AuthenticationTokenMissingException extends HttpException {
    constructor() {
        super(401, "Authentication token missing");
    }
}
