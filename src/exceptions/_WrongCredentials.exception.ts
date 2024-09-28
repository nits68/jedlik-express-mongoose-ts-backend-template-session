import HttpException from "./_Http.exception";

export default class WrongCredentialsException extends HttpException {
    constructor() {
        super(401, "Wrong credentials provided");
    }
}
