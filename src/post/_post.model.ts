import { model, Schema } from "mongoose";

import IPost from "./_post.interface";

// LINK ./post.model.yml
const postSchema = new Schema<IPost>(
    {
        // _id: Schema.Types.ObjectId,
        // 1:N -> N:M, lsd.: athor collection:
        content: String,
        title: {
            type: String,
            required: true,
            maxlength: 50,
        },
        user_id: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

postSchema.virtual("authors", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: false,
});

const postModel = model<IPost>("Post", postSchema, "posts");

export default postModel;
