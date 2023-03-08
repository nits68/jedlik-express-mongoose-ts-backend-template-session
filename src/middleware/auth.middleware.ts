import { NextFunction, Response } from "express";

import HttpException from "../exceptions/HttpException";
// import SessionExpiredException from "../exceptions/SessionExpiredException";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import ISession from "../interfaces/session.interface";
import userModel from "../user/user.model";

export default async function authMiddleware(req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    if (req.session.id && (req.session as ISession).user_id) {
        try {
            const uid = (req.session as ISession).user_id;
            // const user = await userModel.findById((req.session as ISession).user_id);
            const user = await userModel.findById(uid);
            if (user) {
                req.user = user;
                next(req.session);
            } else {
                // next(new SessionExpiredException());
                console.log(req.session);
                next(new HttpException(400, `Hiba1: oid: ${uid} rs: ${req.session}`));
            }
        } catch (error) {
            // next(new SessionExpiredException());
            next(new HttpException(400, "Hiba2"));
        }
    } else {
        // next(new SessionExpiredException());
        next(new HttpException(400, "Hiba1"));
    }
}
