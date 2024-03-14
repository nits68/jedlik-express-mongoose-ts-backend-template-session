import { NextFunction, Request, Response, Router } from "express";
// import ISession from "interfaces/session.interface";
import mongoose, { Schema, Types } from "mongoose";

// import authorModel from "../author/author.model";
import HttpException from "../exceptions/HttpException";
import IdNotValidException from "../exceptions/IdNotValidException";
import PostNotFoundException from "../exceptions/PostNotFoundException";
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
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, [authMiddleware, roleCheckMiddleware(["user"])], this.getPaginatedPosts);
        this.router.patch(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["user"]), validationMiddleware(CreatePostDto, true)], this.modifyPost);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["user"])], this.deletePost);
        this.router.post(this.path, [authMiddleware, roleCheckMiddleware(["user"]), validationMiddleware(CreatePostDto)], this.createPost);
    }

    private getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const posts = await this.post.find().populate("user_id", "-password");
            const count = await this.post.countDocuments();
            const posts = await this.post.find().sort({ _id: 1 });
            res.send({ count: count, posts: posts });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            let posts = [];
            let count: number = 0;
            if (req.params.keyword && req.params.keyword != "") {
                const myRegex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                // count = await this.post.find({ $or: [{ title: myRegex }, { content: myRegex }] }).countDocuments();
                count = await this.post.countDocuments({ $or: [{ title: myRegex }, { content: myRegex }] });
                posts = await this.post
                    .find({ $or: [{ title: myRegex }, { content: myRegex }] })
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.post.countDocuments();
                posts = await this.post
                    .find({})
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.append("X-Total-Count", `${count}`);
            // res.send({ count: count, posts: posts });
            res.send({ posts: posts });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPostById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const post = await this.post.findById(id).populate("author", "-password");

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

    private createPost = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const postData: IPost = req.body;
            const uid: Schema.Types.ObjectId = (req.session as ISession).user_id;
            const createdPost = new this.post({
                ...postData,
                user_id: [uid],
                // 1:N -> N:M, lsd.: athor collection:
                // user_id: req.user._id, // vagy:
                // user_id: (req.session as ISession).user_id,
            });
            const savedPost = await createdPost.save();
            // const createdAuthor = new this.author({
            //     post_id: savedPost._id,
            //     user_id: (req.session as ISession).user_id,
            // });
            // await createdAuthor.save();
            const teszt = await this.user.findByIdAndUpdate(uid, { $push: { post_id: savedPost._id } });
            console.log(teszt);
            await savedPost.populate("user_id", "-password");
            const count = await this.post.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send({ post: savedPost });
            // res.send(savedPost);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

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
                        // commit the changes if everything was successful
                        await session.commitTransaction();
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
