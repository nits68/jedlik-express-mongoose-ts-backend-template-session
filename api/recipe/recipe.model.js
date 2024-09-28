"use strict";
// https://mongoosejs.com/docs/validation.html
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// LINK ./recipe.model.yml
const recipeSchema = new mongoose_1.Schema({
    // _id?: Schema.Types.ObjectId,
    recipeName: {
        type: String,
        required: true,
        maxlength: 50,
    },
    imageURL: String,
    description: String,
    ingredients: Array,
    user_id: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });
recipeSchema.virtual("authors", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: false,
});
const recipeModel = (0, mongoose_1.model)("Recipe", recipeSchema, "recipes");
exports.default = recipeModel;
//# sourceMappingURL=recipe.model.js.map