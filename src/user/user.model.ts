import { model, Schema } from "mongoose";

import addressSchema from "./address.schema";
import IUser from "./user.interface";

/**
 * @openapi
 * components:
 *  schemas:
 *   User:
 *     type: object
 *     properties:
 *      _id:
 *        type: string
 *        description: 'A felhasználó azonosítój- elsődleges kulcs (ObjectId)'
 *        example: 'a11111111111111111111111'
 *      email:
 *        type: string
 *        description: 'A felhasználó e-mail címe'
 *        example: 'student001@jedlik.eu'
 *      email_verified:
 *        type: boolean
 *        description: 'Az e-mail cím megerősítését leíró mező'
 *        example: true
 *      auto_login:
 *        type: boolean
 *        description: 'Az automatikus login funkció ki/be kapcsolása'
 *        example: true
 *      name:
 *        type: string
 *        description: 'A felhasználó neve'
 *        example: 'Student001'
 *      picture:
 *        type: string
 *        description: 'A felhasználó avatar képének URL címe'
 *        example: 'https://lh3.googleusercontent.com/a/ALm5wu1tqlumAaDE2djCuUE2s4ubsOs6HOkdwfU6ftci=s96-c'
 *      password:
 *        type: string
 *        description: 'A felhasználó jelszavára illeszkedő hash kód'
 *        example: '$2b$10$9Czj8XCCZ6Wg5h9HSngl2eMqAO0Pk/LFmf.LrfeLKDXsBQaI07Pv.'
 *      roles:
 *        type: array
 *        description: 'A felhasználó szerepkörei (string array)'
 *        items:
 *           type: string
 *        example: ['user','admin']
 *      address:
 *        $ref: '#/components/schemas/Address'
 *      post_id:
 *        type: array
 *        description: 'A felhasználó postjainak az azonosítója (ObjectId array)'
 *        items:
 *           type: string
 *        example: ['c11111111111111111111111','c33333333333333333333333']
 *      recipe_id:
 *        type: array
 *        description: 'A felhasználó receptjeinek az azonosítója (ObjectId array)'
 *        items:
 *           type: string
 *        example: ['d22222222222222222222222','d33333333333333333333333','d55555555555555555555555']
 *
 */

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
