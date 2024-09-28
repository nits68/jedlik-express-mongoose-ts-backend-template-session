"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EmailNotVerified_exception_1 = tslib_1.__importDefault(require("../exceptions/EmailNotVerified.exception"));
const SessionExpired_exception_1 = tslib_1.__importDefault(require("../exceptions/SessionExpired.exception"));
const user_model_1 = tslib_1.__importDefault(require("../user/user.model"));
async function authMiddleware(req, res, next) {
    if (req.session.id && req.session.user_id) {
        try {
            const user = await user_model_1.default.findById(req.session.user_id);
            if (user && !user.email_verified) {
                next(new EmailNotVerified_exception_1.default(user.email));
            }
            if (user) {
                next();
            }
            else {
                next(new SessionExpired_exception_1.default());
            }
        }
        catch (error) {
            next(new SessionExpired_exception_1.default());
        }
    }
    else {
        next(new SessionExpired_exception_1.default());
    }
}
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map