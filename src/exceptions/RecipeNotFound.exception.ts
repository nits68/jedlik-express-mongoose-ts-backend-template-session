import HttpException from "./Http.exception";

export default class RecipeNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Recipe with id ${id} not found`);
    }
}
