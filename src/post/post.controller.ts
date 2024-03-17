import { NextFunction, Request, Response, Router } from "express";
// import ISession from "interfaces/session.interface";
import mongoose, { Schema, Types } from "mongoose";

// import authorModel from "../author/author.model";
import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import PostNotFoundException from "../exceptions/PostNotFound.exception";
//
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import ISession from "../interfaces/session.interface";
// import ISession from "../interfaces/session.interface";
//
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import userModel from "../user/user.model";
import CreatePostDto from "./post.dto";
import IPost from "./post.interface";
import postModel from "./post.model";

export default class PostController implements IController {
    public path = "/posts";
    public router = Router();
    private post = postModel;
    // private author = authorModel;
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, [authMiddleware, roleCheckMiddleware(["user"])], this.getAllPosts);
        this.router.get(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["user"])], this.getPostById);
        this.router.get(`${this.path}/:offset/:limit/:sortField/:filter?`, [authMiddleware, roleCheckMiddleware(["user"])], this.getPaginatedPosts);
        this.router.patch(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["user"]), validationMiddleware(CreatePostDto, true)], this.modifyPost);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["user"])], this.deletePost);
        this.router.post(this.path, [authMiddleware, roleCheckMiddleware(["user"]), validationMiddleware(CreatePostDto)], this.createPost);
    }

    // LINK ./post.controller.yml#getAllPosts
    // ANCHOR[id=getAllPosts]
    private getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const posts = await this.post.find().populate("user_id", "-password");
            const count = await this.post.countDocuments();
            const posts = await this.post.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(posts);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./post.controller.yml#getPaginatedPosts
    // ANCHOR[id=getPaginatedPosts]
    private getPaginatedPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const sortField = req.params.sortField;
            let posts = [];
            let count: number = 0;
            if (req.params.filter && req.params.filter != "") {
                const myRegex = new RegExp(req.params.filter, "i"); // i for case insensitive
                // count = await this.post.find({ $or: [{ title: myRegex }, { content: myRegex }] }).countDocuments();
                count = await this.post.countDocuments({ $or: [{ title: myRegex }, { content: myRegex }] });
                posts = await this.post
                    .find({ $or: [{ title: myRegex }, { content: myRegex }] })
                    .sort(sortField)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.post.countDocuments();
                posts = await this.post.find({}).sort(sortField).skip(offset).limit(limit);
            }
            res.append("x-total-count", `${count}`);
            // res.send({ count: count, posts: posts });
            res.send(posts);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./post.controller.yml#getPostById
    // ANCHOR[id=getPostById]
    private getPostById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const post = await this.post.findById(id).populate("user_id", "-password");

                if (post) {
                    res.send(post);
                } else {
                    next(new PostNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./post.controller.yml#modifyPost
    // ANCHOR[id=modifyPost]
    private modifyPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const postData: IPost = req.body;
                const post = await this.post.findByIdAndUpdate(id, postData, { new: true });
                if (post) {
                    res.send(post);
                } else {
                    next(new PostNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./post.controller.yml#createPost
    // ANCHOR[id=createPost]
    private createPost = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const postData: IPost = req.body;
            const uid: Schema.Types.ObjectId = (req.session as ISession).user_id;
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
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./post.controller.yml#deletePost
    // ANCHOR[id=deletePost]
    private deletePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                // Start session and transaction
                const session = await mongoose.startSession();
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
                    } else {
                        next(new PostNotFoundException(id));
                    }
                } catch (error) {
                    // if anything fails above just rollback the changes here

                    // this will rollback any changes made in the database
                    await session.abortTransaction();
                    // logging the error
                    // console.error(error);
                    next(new HttpException(400, error.message));
                } finally {
                    // ending the session
                    session.endSession();
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
