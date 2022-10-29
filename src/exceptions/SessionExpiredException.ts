import HttpException from "./HttpException";

export default class SessionExpiredException extends HttpException {
    constructor() {
        super(401, "Session has expired, please log in again!");
    }
}
