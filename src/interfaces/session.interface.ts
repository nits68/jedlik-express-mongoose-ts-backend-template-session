import { Session } from "express-session";
import { Schema } from "mongoose";

export default interface ISession extends Session {
    user_id: Schema.Types.ObjectId;
    user_email: string;
    isAutoLogin: boolean;
    isLoggedIn: boolean;
}
