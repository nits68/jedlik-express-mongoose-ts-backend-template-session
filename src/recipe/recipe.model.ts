// https://mongoosejs.com/docs/validation.html

import { model, Schema } from "mongoose";

import IRecipe from "./recipe.interface";

const recipeSchema = new Schema<IRecipe>(
    {
        // _id?: Schema.Types.ObjectId,
        recipeName: {
            type: String,
            required: true,
            maxlength: 50,
        },
        imageURL: String,
        description: String,
        ingredients: Array,
        user_id: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// recipeSchema.virtual("author", {
//     ref: "User",
//     localField: "user_id",
//     foreignField: "_id",
//     justOne: true,
// });

const recipeModel = model<IRecipe>("Recipe", recipeSchema, "recipes");

export default recipeModel;
