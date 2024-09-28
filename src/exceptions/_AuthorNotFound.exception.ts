import HttpException from "./_Http.exception";

export default class AuthorNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Author with id ${id} not found`);
    }
}
