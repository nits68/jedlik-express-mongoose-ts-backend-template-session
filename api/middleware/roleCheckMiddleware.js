"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("../exceptions/Http.exception"));
const InsufficientRole_exception_1 = tslib_1.__importDefault(require("../exceptions/InsufficientRole.exception"));
function roleCheckMiddleware(req_roles) {
    return (req, res, next) => {
        if (req.session.id && req.session.roles) {
            const intersectRoles = req.session.roles.filter(value => req_roles.includes(value));
            if (intersectRoles.length > 0) {
                next();
            }
            else {
                next(new InsufficientRole_exception_1.default());
            }
        }
        else {
            next(new Http_exception_1.default(400, "Error with session data"));
        }
    };
}
exports.default = roleCheckMiddleware;
//# sourceMappingURL=roleCheckMiddleware.js.map