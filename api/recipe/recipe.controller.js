"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const Http_exception_1 = tslib_1.__importDefault(require("../exceptions/Http.exception"));
const IdNotValid_exception_1 = tslib_1.__importDefault(require("../exceptions/IdNotValid.exception"));
const RecipeNotFound_exception_1 = tslib_1.__importDefault(require("../exceptions/RecipeNotFound.exception"));
const auth_middleware_1 = tslib_1.__importDefault(require("../middleware/auth.middleware"));
const validation_middleware_1 = tslib_1.__importDefault(require("../middleware/validation.middleware"));
const user_model_1 = tslib_1.__importDefault(require("../user/user.model"));
const recipe_dto_1 = tslib_1.__importDefault(require("./recipe.dto"));
const recipe_model_1 = tslib_1.__importDefault(require("./recipe.model"));
class RecipeController {
    path = "/recipes";
    router = (0, express_1.Router)();
    recipe = recipe_model_1.default;
    user = user_model_1.default;
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, auth_middleware_1.default, this.getAllRecipes);
        this.router.patch(`${this.path}/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(recipe_dto_1.default, true)], this.modifyRecipe);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.getRecipeById);
        this.router.get(`${this.path}/:offset/:limit/:sortField/:filter?`, auth_middleware_1.default, this.getPaginatedRecipes);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, this.deleteRecipe);
        this.router.post(this.path, [auth_middleware_1.default, (0, validation_middleware_1.default)(recipe_dto_1.default)], this.createRecipe);
    }
    // LINK ./recipe.controller.yml#getAllRecipes
    // ANCHOR[id=getAllRecipes]
    getAllRecipes = async (req, res, next) => {
        try {
            const count = await this.recipe.countDocuments();
            const recipes = await this.recipe.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(recipes);
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./recipe.controller.yml#getPaginatedRecipes
    // ANCHOR[id=getPaginatedRecipes]
    getPaginatedRecipes = async (req, res, next) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const sortField = req.params.sortField;
            let recipes = [];
            let count = 0;
            if (req.params.filter && req.params.filter != "") {
                const myRegex = new RegExp(req.params.filter, "i"); // i for case insensitive
                // count = await this.recipeM.find({ $or: [{ recipeName: myRegex }, { description: myRegex }] }).countDocuments();
                count = await this.recipe.countDocuments({ $or: [{ recipeName: myRegex }, { description: myRegex }] });
                recipes = await this.recipe
                    .find({ $or: [{ recipeName: myRegex }, { description: myRegex }] })
                    .sort(sortField)
                    .skip(offset)
                    .limit(limit);
            }
            else {
                count = await this.recipe.countDocuments();
                recipes = await this.recipe.find({}).sort(sortField).skip(offset).limit(limit);
            }
            res.append("x-total-count", `${count}`);
            // res.send({ count: count, recipes: recipes });
            res.send(recipes);
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./recipe.controller.yml#getRecipeById
    // ANCHOR[id=getRecipeById]
    getRecipeById = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                const recipe = await this.recipe.findById(id).populate("user_id", "-password");
                if (recipe) {
                    res.send(recipe);
                }
                else {
                    next(new RecipeNotFound_exception_1.default(id));
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
    // LINK ./recipe.controller.yml#modifyRecipe
    // ANCHOR[id=modifyRecipe]
    modifyRecipe = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                const recipeData = req.body;
                const recipe = await this.recipe.findByIdAndUpdate(id, recipeData, { new: true });
                if (recipe) {
                    res.send(recipe);
                }
                else {
                    next(new RecipeNotFound_exception_1.default(id));
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
    // LINK ./recipe.controller.yml#createRecipe
    // ANCHOR[id=createRecipe]
    createRecipe = async (req, res, next) => {
        try {
            const recipeData = req.body;
            const uid = req.session.user_id;
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
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./recipe.controller.yml#deleteRecipe
    // ANCHOR[id=deleteRecipe]
    deleteRecipe = async (req, res, next) => {
        try {
            const id = req.params.id;
            if (mongoose_1.Types.ObjectId.isValid(id)) {
                // Start session and transaction
                const session = await mongoose_1.default.startSession();
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
                    }
                    else {
                        next(new RecipeNotFound_exception_1.default(id));
                    }
                }
                catch (error) {
                    // if anything fails above just rollback the changes here
                    // this will rollback any changes made in the database
                    await session.abortTransaction();
                    // logging the error
                    // console.error(error);
                    next(new Http_exception_1.default(400, error.message));
                }
                finally {
                    // ending the session
                    session.endSession();
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
}
exports.default = RecipeController;
//# sourceMappingURL=recipe.controller.js.map