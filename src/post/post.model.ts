import { Schema, model } from "mongoose";
import IPost from "./post.interface";

const postSchema = new Schema<IPost>(
    {
        author: {
            ref: "User",
            type: Schema.Types.ObjectId,
        },
        content: String,
        title: {
            type: String,
            required: true,
            maxlength: 50,
        },
    },
    { versionKey: false },
);

const postModel = model<IPost>("Post", postSchema, "posts");

export default postModel;
