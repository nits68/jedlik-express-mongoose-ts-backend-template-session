"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = require("mongoose");
const address_schema_1 = tslib_1.__importDefault(require("./address.schema"));
// LINK ./user.model.yml
const userSchema = new mongoose_1.Schema({
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
        type: address_schema_1.default,
        required: true,
    },
    post_id: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
    recipe_id: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Recipe" }],
}, { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });
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
const userModel = (0, mongoose_1.model)("User", userSchema, "users");
exports.default = userModel;
//# sourceMappingURL=user.model.js.map