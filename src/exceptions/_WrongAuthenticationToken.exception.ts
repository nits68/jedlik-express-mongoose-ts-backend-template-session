import HttpException from "./_Http.exception";

export default class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, "Wrong authentication token");
    }
}
