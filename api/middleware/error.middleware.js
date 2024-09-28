"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function errorMiddleware(error, req, res, next) {
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    res.status(status).send({
        message,
        status,
    });
    next();
}
exports.default = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map