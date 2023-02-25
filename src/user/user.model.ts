import { Types, Schema, model } from "mongoose";
import IUser from "./user.interface";

const addressSchema = new Schema(
    {
        city: String,
        country: String,
        street: String,
    },
    { versionKey: false },
);

const userSchema = new Schema<IUser>(
    {
        _id: Types.ObjectId,
        address: addressSchema,
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
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.virtual("recipes", {
    ref: "Recipes",
    localField: "_id",
    foreignField: "user_id", // ref_Field
    justOne: false,
});

userSchema.virtual("posts", {
    ref: "Posts",
    localField: "_id",
    foreignField: "user_id", // ref_Field
    justOne: false,
});

const userModel = model<IUser>("Users", userSchema, "users");

export default userModel;
