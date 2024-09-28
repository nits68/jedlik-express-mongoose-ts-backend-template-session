"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const mongoose_1 = require("mongoose");
// import authorModel from "../author/author.model";
const Http_exception_1 = tslib_1.__importDefault(require("../exceptions/Http.exception"));
const IdNotValid_exception_1 = tslib_1.__importDefault(require("../exceptions/IdNotValid.exception"));
const UserNotFound_exception_1 = tslib_1.__importDefault(require("../exceptions/UserNotFound.exception"));
const auth_middleware_1 = tslib_1.__importDefault(require("../middleware/auth.middleware"));
const validation_middleware_1 = tslib_1.__importDefault(require("../middleware/validation.middleware"));
const post_model_1 = tslib_1.__importDefault(require("../post/post.model"));
const user_dto_1 = tslib_1.__importDefault(require("./user.dto"));
const user_model_1 = tslib_1.__importDefault(require("./user.model"));
class UserController {
    path = "/users";
    router = (0, express_1.Router)();
    user = user_model_1.default;
    post = post_model_1.default;
    // private author = authorModel;
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        // this.router.get(`${this.path}/posts/:id`, authMiddleware, this.getAllPostsOfUserByID);
        this.router.get(`${this.path}/posts/`, auth_middleware_1.default, this.getAllPostsOfLoggedUser);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.getUserById);
        this.router.get(this.path, auth_middleware_1.default, this.getAllUsers);
        this.router.get(`${this.path}/posts/search/:keyword`, this.getUsersPostsWithSearch);
        this.router.patch(`${this.path}/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(user_dto_1.default, true)], this.modifyUser);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, this.deleteUser);
    }
    /**
     * @openapi
     * /users:
     *  get:
     *    tags:
     *      - Users
     *    security: []
     *    summary: Az összes felhasználó lekérdezése
     *    description: A végpont az összes felhasználót kérdezi le
     *    responses:
     *      '200':
     *        description: OK.
     *        content:
     *          application/json:
     *            schema:
     *                $ref: '#/components/schemas/User'
     *        headers:
     *           x-total-count:
     *              description: A felhasználók száma
     *              schema:
     *                type: number
     *                example: 3
     *      '4XX':
     *        description: Hiba
     *        content:
     *          application/json:
     *            schema:
     *                $ref: '#/components/schemas/Error'
     *
     */
    getAllUsers = async (req, res, next) => {
        try {
            const count = await this.user.countDocuments();
            this.user
                .find()
                // .populate("recipes")
                .sort({ _id: 1 })
                .then(users => {
                res.append("x-total-count", `${count}`);
                res.send(users);
            });
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    getUserById = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                // const userQuery = this.user.findById(id);
                // if (request.query.withPosts === "true") {
                //     userQuery.populate("posts").exec();
                // }
                // Multiple populates:
                // const user = await this.user.findById(id).populate("recipes").populate("recipes");
                const user = await this.user.findById(id).populate("recipes");
                if (user) {
                    res.send(user);
                }
                else {
                    next(new UserNotFound_exception_1.default(id));
                }
            }
            else {
                next(new IdNotValid_exception_1.default(id));
            }
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    modifyUser = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                const userData = req.body;
                const user = await this.user.findByIdAndUpdate(id, userData, { new: true });
                if (user) {
                    res.send(user);
                }
                else {
                    next(new UserNotFound_exception_1.default(id));
                }
            }
            else {
                next(new IdNotValid_exception_1.default(id));
            }
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    deleteUser = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                const successResponse = await this.user.findByIdAndDelete(id);
                if (successResponse) {
                    res.sendStatus(200);
                }
                else {
                    next(new UserNotFound_exception_1.default(id));
                }
            }
            else {
                next(new IdNotValid_exception_1.default(id));
            }
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    getAllPostsOfLoggedUser = async (req, res, next) => {
        try {
            const id = req.session.user_id; // Stored user's ID in Cookie
            const posts = await this.post.find({ user_id: id });
            res.send(posts);
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    // private getAllPostsOfUserByID = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         if (Types.ObjectId.isValid(req.params.id)) {
    //             const id: string = req.params.id;
    //             const posts = await this.author.find({ user_id: id }).select("-user_id").populate("post", "-_id");
    //             res.send(posts);
    //         } else {
    //             next(new IdNotValidException(req.params.id));
    //         }
    //     } catch (error) {
    //         next(new HttpException(400, error.message));
    //     }
    // };
    getUsersPostsWithSearch = async (req, res, next) => {
        try {
            const myRegex = new RegExp(req.params.keyword, "i"); // "i" for case-insensitive
            const data = await this.user.aggregate([
                {
                    $lookup: { from: "authors", foreignField: "user_id", localField: "_id", as: "author" },
                },
                {
                    $lookup: { from: "posts", foreignField: "_id", localField: "author.post_id", as: "post" },
                },
                {
                    $match: { $and: [{ "address.street": myRegex }, { "post.content": myRegex }] },
                    // $match: { "FK_neve.field1": req.params.keyword },
                },
                // {
                //     // convert array of objects to simple array (alias name):
                //     $unwind: "$FK_neve",
                // },
                { $project: { name: 1, "address.street": 1, post: 1 } },
            ]);
            res.send(data);
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map