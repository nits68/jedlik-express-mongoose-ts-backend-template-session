"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// LINK ./post.model.yml
const postSchema = new mongoose_1.Schema({
    // _id: Schema.Types.ObjectId,
    // 1:N -> N:M, lsd.: athor collection:
    content: String,
    title: {
        type: String,
        required: true,
        maxlength: 50,
    },
    user_id: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });
postSchema.virtual("authors", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: false,
});
const postModel = (0, mongoose_1.model)("Post", postSchema, "posts");
exports.default = postModel;
//# sourceMappingURL=post.model.js.map