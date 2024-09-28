"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
// import ISession from "interfaces/session.interface";
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
// import authorModel from "../author/author.model";
const _Http_exception_1 = tslib_1.__importDefault(require("../exceptions/_Http.exception"));
const _IdNotValid_exception_1 = tslib_1.__importDefault(require("../exceptions/_IdNotValid.exception"));
const _PostNotFound_exception_1 = tslib_1.__importDefault(require("../exceptions/_PostNotFound.exception"));
// import ISession from "../interfaces/session.interface";
//
const _auth_middleware_1 = tslib_1.__importDefault(require("../middleware/_auth.middleware"));
const _roleCheckMiddleware_1 = tslib_1.__importDefault(require("../middleware/_roleCheckMiddleware"));
const _validation_middleware_1 = tslib_1.__importDefault(require("../middleware/_validation.middleware"));
const _user_model_1 = tslib_1.__importDefault(require("../user/_user.model"));
const _post_dto_1 = tslib_1.__importDefault(require("./_post.dto"));
const _post_model_1 = tslib_1.__importDefault(require("./_post.model"));
class PostController {
    path = "/posts";
    router = (0, express_1.Router)();
    post = _post_model_1.default;
    // private author = authorModel;
    user = _user_model_1.default;
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, [_auth_middleware_1.default, (0, _roleCheckMiddleware_1.default)(["user"])], this.getAllPosts);
        this.router.get(`${this.path}/:id`, [_auth_middleware_1.default, (0, _roleCheckMiddleware_1.default)(["user"])], this.getPostById);
        this.router.get(`${this.path}/:offset/:limit/:sortField/:filter?`, [_auth_middleware_1.default, (0, _roleCheckMiddleware_1.default)(["user"])], this.getPaginatedPosts);
        this.router.patch(`${this.path}/:id`, [_auth_middleware_1.default, (0, _roleCheckMiddleware_1.default)(["user"]), (0, _validation_middleware_1.default)(_post_dto_1.default, true)], this.modifyPost);
        this.router.delete(`${this.path}/:id`, [_auth_middleware_1.default, (0, _roleCheckMiddleware_1.default)(["user"])], this.deletePost);
        this.router.post(this.path, [_auth_middleware_1.default, (0, _roleCheckMiddleware_1.default)(["user"]), (0, _validation_middleware_1.default)(_post_dto_1.default)], this.createPost);
    }
    // LINK ./post.controller.yml#getAllPosts
    // ANCHOR[id=getAllPosts]
    getAllPosts = async (req, res, next) => {
        try {
            // const posts = await this.post.find().populate("user_id", "-password");
            const count = await this.post.countDocuments();
            const posts = await this.post.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(posts);
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./post.controller.yml#getPaginatedPosts
    // ANCHOR[id=getPaginatedPosts]
    getPaginatedPosts = async (req, res, next) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const sortField = req.params.sortField;
            let posts = [];
            let count = 0;
            if (req.params.filter && req.params.filter != "") {
                const myRegex = new RegExp(req.params.filter, "i"); // i for case insensitive
                // count = await this.post.find({ $or: [{ title: myRegex }, { content: myRegex }] }).countDocuments();
                count = await this.post.countDocuments({ $or: [{ title: myRegex }, { content: myRegex }] });
                posts = await this.post
                    .find({ $or: [{ title: myRegex }, { content: myRegex }] })
                    .sort(sortField)
                    .skip(offset)
                    .limit(limit);
            }
            else {
                count = await this.post.countDocuments();
                posts = await this.post.find({}).sort(sortField).skip(offset).limit(limit);
            }
            res.append("x-total-count", `${count}`);
            // res.send({ count: count, posts: posts });
            res.send(posts);
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./post.controller.yml#getPostById
    // ANCHOR[id=getPostById]
    getPostById = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                const post = await this.post.findById(id).populate("user_id", "-password");
                if (post) {
                    res.send(post);
                }
                else {
                    next(new _PostNotFound_exception_1.default(id));
                }
            }
            else {
                next(new _IdNotValid_exception_1.default(id));
            }
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./post.controller.yml#modifyPost
    // ANCHOR[id=modifyPost]
    modifyPost = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                const postData = req.body;
                const post = await this.post.findByIdAndUpdate(id, postData, { new: true });
                if (post) {
                    res.send(post);
                }
                else {
                    next(new _PostNotFound_exception_1.default(id));
                }
            }
            else {
                next(new _IdNotValid_exception_1.default(id));
            }
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./post.controller.yml#createPost
    // ANCHOR[id=createPost]
    createPost = async (req, res, next) => {
        try {
            const postData = req.body;
            const uid = req.session.user_id;
            const createdPost = new this.post({
                ...postData,
                user_id: [uid],
            });
            const savedPost = await createdPost.save();
            await this.user.findByIdAndUpdate(uid, { $push: { post_id: savedPost._id } });
            await savedPost.populate("user_id", "-password");
            const count = await this.post.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send(savedPost);
            // res.send(savedPost);
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./post.controller.yml#deletePost
    // ANCHOR[id=deletePost]
    deletePost = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                // Start session and transaction
                const session = await mongoose_1.default.startSession();
                session.startTransaction();
                try {
                    // always pass session to find queries when the data is needed for the transaction session
                    const post = await this.post.findOne({ _id: id }).session(session);
                    if (post) {
                        // Delete post:
                        const successResponse = await this.post.findByIdAndDelete(id);
                        if (successResponse) {
                            const users = await this.user.find({ post_id: id }).session(session);
                            if (users) {
                                // Delete all references from user collection:
                                await this.user.updateMany({ post_id: id }, { $pull: { post_id: id } });
                            }
                        }
                        // commit the changes if everything (delete and update) was successful
                        await session.commitTransaction();
                        const count = await this.post.countDocuments();
                        res.append("x-total-count", `${count}`);
                        res.sendStatus(200);
                    }
                    else {
                        next(new _PostNotFound_exception_1.default(id));
                    }
                }
                catch (error) {
                    // if anything fails above just rollback the changes here
                    // this will rollback any changes made in the database
                    await session.abortTransaction();
                    // logging the error
                    // console.error(error);
                    next(new _Http_exception_1.default(400, error.message));
                }
                finally {
                    // ending the session
                    session.endSession();
                }
            }
            else {
                next(new _IdNotValid_exception_1.default(id));
            }
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
}
exports.default = PostController;
//# sourceMappingURL=_post.controller.js.map