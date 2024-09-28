"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const _Http_exception_1 = tslib_1.__importDefault(require("../exceptions/_Http.exception"));
const _user_model_1 = tslib_1.__importDefault(require("../user/_user.model"));
class ReportController {
    path = "/report";
    router = (0, express_1.Router)();
    user = _user_model_1.default;
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/hello", (req, res) => {
            res.send("Hello World!");
        });
        this.router.get(`${this.path}`, this.generateReport);
    }
    generateReport = async (req, res, next) => {
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
        }
        catch (error) {
            next(new _Http_exception_1.default(400, error.message));
        }
    };
}
exports.default = ReportController;
//# sourceMappingURL=_report.controller.js.map