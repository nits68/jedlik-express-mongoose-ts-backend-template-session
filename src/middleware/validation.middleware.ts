import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import express from "express";

import HttpException from "../exceptions/Http.exception";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export default function validationMiddleware(type: any, skipMissingProp = false): express.RequestHandler {
    return (req, res, next) => {
        // forbidUnknownValues: false
        // const validatorObject = Object.assign(new type(), req.body);
        validate(plainToInstance(type, req.body), { skipMissingProperties: skipMissingProp }).then((errors: ValidationError[]) => {
            if (errors!.length > 0) {
                // Break down, if validate nested object in latest version of class-validator
                // const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(", ");
                const message: string[] = [];
                for (let i = 0; i < errors.length; i++) {
                    if (errors[i].constraints) {
                        message.push(Object.values(errors[i].constraints).join(", "));
                    }
                    if (errors[i].children!.length > 0) {
                        for (let j = 0; j < errors[i].children.length; j++) {
                            if (errors[i].children[j].constraints) {
                                message.push(Object.values(errors[i].children[j].constraints).join(", "));
                            }
                        }
                    }
                }
                next(new HttpException(400, "DTO error: " + message.join("; ")));
            } else {
                next();
            }
        });
    };
}

// Links:
// class-transformer: https://www.jsdocs.io/package/class-transformer#plainToInstance
// class-validator: https://github.com/typestack/class-validator
