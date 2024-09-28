import { model, Schema } from "mongoose";

import addressSchema from "./_address.schema";
import IUser from "./_user.interface";

// LINK ./user.model.yml
const userSchema = new Schema<IUser>(
    {
        // _id: Schema.Types.ObjectId,
        email: {
            type: String,
            required: true,
        },
        email_verified: {
            type: Boolean,
            required: true,
        },
        auto_login: {
            type: Boolean,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        picture: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        roles: {
            type: [String], // Array of string
            required: true,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        post_id: [{ type: Schema.Types.ObjectId, ref: "Post" }],
        recipe_id: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.virtual("recipes", {
    ref: "Recipe",
    localField: "recipe_id",
    foreignField: "_id",
    justOne: false,
});

userSchema.virtual("posts", {
    ref: "Post",
    localField: "post_id",
    foreignField: "_id",
    justOne: false,
});

const userModel = model<IUser>("User", userSchema, "users");

export default userModel;
