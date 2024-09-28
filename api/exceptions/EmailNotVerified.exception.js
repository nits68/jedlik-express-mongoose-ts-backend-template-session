"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Http_exception_1 = tslib_1.__importDefault(require("./Http.exception"));
class EmailNotVerifiedException extends Http_exception_1.default {
    constructor(email) {
        super(401, `Your Email ${email} has not been verified. Please click on resend!`);
    }
}
exports.default = EmailNotVerifiedException;
//# sourceMappingURL=EmailNotVerified.exception.js.map