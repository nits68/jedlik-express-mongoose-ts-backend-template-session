import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import express from "express";

import HttpException from "../exceptions/HttpException";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export default function validationMiddleware(type: any, skipMissingProp = false): express.RequestHandler {
    return (req, res, next) => {
        validate(plainToInstance(type, req.body), { skipMissingProperties: skipMissingProp, whitelist: true, forbidNonWhitelisted: true }).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                let message: string = "";
                for (const e of errors) {
                    if (e.constraints) {
                        if (message.length > 0 && !message.endsWith(", ")) message += ", ";
                        message += Object.values(e.constraints).join(", ");
                    }
                    if (e.children) {
                        for (const c of e.children) {
                            if (message.length > 0 && !message.endsWith(", ")) message += ", ";
                            const children_errors: string[] = [];
                            for (const v of Object.values(c.constraints)) {
                                children_errors.push(`${e.property}.${v}`);
                            }
                            message += children_errors.join(", ");
                        }
                    }
                }
                next(new HttpException(400, message));
            } else {
                next();
            }
        });
    };
}

// Links:
// class-transformer: https://www.jsdocs.io/package/class-transformer#plainToInstance
// class-validator: https://github.com/typestack/class-validator
