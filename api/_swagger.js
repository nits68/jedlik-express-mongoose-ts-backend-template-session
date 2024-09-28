"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = require("dotenv");
const swagger_jsdoc_1 = tslib_1.__importDefault(require("swagger-jsdoc"));
(0, dotenv_1.config)();
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Jedlik API docs 123",
            version: "0.0.1",
            description: "<img alt='DB_diagram' height='700px' src='https://nits68.github.io/static/session/db_diagram_new_new.jpg' />",
        },
        servers: [
            {
                url: process.env.BACKEND_API,
            },
        ],
    },
    apis: [`${__dirname}/**/*.{mod,cont,dto,controller,model,exception}.{ts,js,yml}`],
};
exports.default = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=_swagger.js.map