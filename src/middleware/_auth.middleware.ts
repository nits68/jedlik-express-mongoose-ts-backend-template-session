import { NextFunction, Response } from "express";

import EmailNotVerifiedException from "../exceptions/_EmailNotVerified.exception";
import SessionExpiredException from "../exceptions/_SessionExpired.exception";
import IRequestWithUser from "../interfaces/_requestWithUser.interface";
import ISession from "../interfaces/_session.interface";
import userModel from "../user/_user.model";

export default async function authMiddleware(req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    if (req.session.id && (req.session as ISession).user_id) {
        try {
            const user = await userModel.findById((req.session as ISession).user_id);
            if (user && !user.email_verified) {
                next(new EmailNotVerifiedException(user.email));
            }
            if (user) {
                next();
            } else {
                next(new SessionExpiredException());
            }
        } catch (error) {
            next(new SessionExpiredException());
        }
    } else {
        next(new SessionExpiredException());
    }
}
