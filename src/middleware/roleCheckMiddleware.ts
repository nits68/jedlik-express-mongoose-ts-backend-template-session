import { NextFunction, Response } from "express";
import express from "express";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import InsufficientRoleException from "../exceptions/InsufficientRoleException";

export default function roleCheckMiddleware(req_role_bits = 0): express.RequestHandler {
    return (req: IRequestWithUser, res: Response, next: NextFunction) => {
        if ((req.user.role_bits & req_role_bits) == req_role_bits) {
            next();
        } else {
            next(new InsufficientRoleException());
        }
    };
}

// User role bits: max 8 collections (tables) (c1-c8), each one with CRUD rights (create, read, update, delete)
//                          c8   c7   c6   c5   c4   c3   c2   c1
// const userRole_bits = 0b 1111 1111 1111 1111 1111 1111 1111 1111; // without spaces
// Collections
// c1 -> users
// c2 -> posts
// c3 -> recipes
// c4 -> xy4
// c5 ...
