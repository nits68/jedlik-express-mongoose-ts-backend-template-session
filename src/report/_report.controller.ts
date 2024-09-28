import { NextFunction, Request, Response, Router } from "express";

import HttpException from "../exceptions/_Http.exception";
import IController from "../interfaces/_controller.interface";
import userModel from "../user/_user.model";

export default class ReportController implements IController {
    public path = "/report";
    public router = Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/hello", (req: Request, res: Response) => {
            res.send("Hello World!");
        });
        this.router.get(`${this.path}`, this.generateReport);
    }

    private generateReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usersByCities = await this.user.aggregate([
                {
                    $match: {
                        "address.city": {
                            $exists: true,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            city: "$address.city",
                        },
                        users: {
                            $push: {
                                _id: "$_id",
                                name: "$name",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "users._id",
                        foreignField: "user_id",
                        as: "auth",
                    },
                },
                {
                    $addFields: {
                        amountOfArticles: {
                            $size: "$auth",
                        },
                    },
                },
                {
                    $sort: {
                        amountOfArticles: 1,
                    },
                },
            ]);
            res.send({
                usersByCities,
            });
            next();
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
