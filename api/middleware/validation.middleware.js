"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Http_exception_1 = tslib_1.__importDefault(require("../exceptions/Http.exception"));
function getAllConstraints(errors) {
    const constraints = [];
    for (const error of errors) {
        if (error.constraints) {
            const constraintValues = Object.values(error.constraints);
            constraints.push(...constraintValues);
        }
        if (error.children) {
            const childConstraints = getAllConstraints(error.children);
            constraints.push(...childConstraints);
        }
    }
    return constraints;
}
function validationMiddleware(type, skipMissingProp = false) {
    return (req, res, next) => {
        (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(type, req.body), { skipMissingProperties: skipMissingProp }).then((errors) => {
            if (errors.length > 0) {
                next(new Http_exception_1.default(400, "DTO error(s): " + getAllConstraints(errors).join(", ")));
            }
            else {
                next();
            }
        });
    };
}
exports.default = validationMiddleware;
// Links:
// class-transformer: https://www.jsdocs.io/package/class-transformer#plainToInstance
// class-validator: https://github.com/typestack/class-validator
//# sourceMappingURL=validation.middleware.js.map