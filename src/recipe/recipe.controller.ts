import { NextFunction, Request, Response, Router } from "express";
import ISession from "interfaces/session.interface";
import mongoose, { Schema, Types } from "mongoose";

import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import RecipeNotFoundException from "../exceptions/RecipeNotFound.exception";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import userModel from "../user/user.model";
import CreateRecipeDto from "./recipe.dto";
import IRecipe from "./recipe.interface";
import recipeModel from "./recipe.model";

export default class RecipeController implements IController {
    public path = "/recipes";
    public router = Router();
    private recipe = recipeModel;
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllRecipes);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateRecipeDto, true)], this.modifyRecipe);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getRecipeById);
        this.router.get(`${this.path}/:offset/:limit/:sortField/:filter?`, authMiddleware, this.getPaginatedRecipes);

        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteRecipe);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateRecipeDto)], this.createRecipe);
    }

    // LINK ./recipe.controller.yml#getAllRecipes
    // ANCHOR[id=getAllRecipes]
    private getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.recipe.countDocuments();
            const recipes = await this.recipe.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(recipes);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./recipe.controller.yml#getPaginatedRecipes
    // ANCHOR[id=getPaginatedRecipes]
    private getPaginatedRecipes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const sortField = req.params.sortField;
            let recipes = [];
            let count: number = 0;
            if (req.params.filter && req.params.filter != "") {
                const myRegex = new RegExp(req.params.filter, "i"); // i for case insensitive
                // count = await this.recipeM.find({ $or: [{ recipeName: myRegex }, { description: myRegex }] }).countDocuments();
                count = await this.recipe.countDocuments({ $or: [{ recipeName: myRegex }, { description: myRegex }] });
                recipes = await this.recipe
                    .find({ $or: [{ recipeName: myRegex }, { description: myRegex }] })
                    .sort(sortField)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.recipe.countDocuments();
                recipes = await this.recipe.find({}).sort(sortField).skip(offset).limit(limit);
            }
            res.append("x-total-count", `${count}`);
            // res.send({ count: count, recipes: recipes });
            res.send(recipes);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./recipe.controller.yml#getRecipeById
    // ANCHOR[id=getRecipeById]
    private getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const recipe = await this.recipe.findById(id).populate("user_id", "-password");
                if (recipe) {
                    res.send(recipe);
                } else {
                    next(new RecipeNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./recipe.controller.yml#modifyRecipe
    // ANCHOR[id=modifyRecipe]
    private modifyRecipe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const recipeData: IRecipe = req.body;
                const recipe = await this.recipe.findByIdAndUpdate(id, recipeData, { new: true });
                if (recipe) {
                    res.send(recipe);
                } else {
                    next(new RecipeNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./recipe.controller.yml#createRecipe
    // ANCHOR[id=createRecipe]
    private createRecipe = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const recipeData: IRecipe = req.body;
            const uid: Schema.Types.ObjectId = (req.session as ISession).user_id;
            const createdRecipe = new this.recipe({
                ...recipeData,
                user_id: [uid],
            });
            const savedRecipe = await createdRecipe.save();
            // await savedRecipe.populate("user_id", "-password");
            await this.user.findByIdAndUpdate(uid, { $push: { post_id: savedRecipe._id } });
            const count = await this.recipe.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send(savedRecipe);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./recipe.controller.yml#deleteRecipe
    // ANCHOR[id=deleteRecipe]
    private deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                // Start session and transaction
                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    // always pass session to find queries when the data is needed for the transaction session
                    const recipe = await this.recipe.findOne({ _id: id }).session(session);
                    if (recipe) {
                        const successResponse = await this.recipe.findByIdAndDelete(id);
                        if (successResponse) {
                            const users = await this.user.find({ recipe_id: id }).session(session);
                            if (users) {
                                // Delete all references from user collection:
                                await this.user.updateMany({ recipe_id: id }, { $pull: { recipe_id: id } });
                            }
                        }
                        // commit the changes if everything (delete and update) was successful
                        await session.commitTransaction();
                        const count = await this.recipe.countDocuments();
                        res.append("x-total-count", `${count}`);
                        res.sendStatus(200);
                    } else {
                        next(new RecipeNotFoundException(id));
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
