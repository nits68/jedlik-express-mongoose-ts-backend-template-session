import { Schema } from "mongoose";
export default interface IPost {
    _id?: Schema.Types.ObjectId;
    // user_id?: Schema.Types.ObjectId; // 1:N -> N:M, lsd.: athor collection
    content: string;
    title: string;
}
