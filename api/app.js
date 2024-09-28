"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const connect_mongo_1 = tslib_1.__importDefault(require("connect-mongo"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = tslib_1.__importDefault(require("express"));
const express_session_1 = tslib_1.__importDefault(require("express-session"));
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const path_1 = tslib_1.__importDefault(require("path"));
const serve_favicon_1 = tslib_1.__importDefault(require("serve-favicon"));
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const error_middleware_1 = tslib_1.__importDefault(require("./middleware/error.middleware"));
const swagger_1 = tslib_1.__importDefault(require("./swagger"));
class App {
    app;
    controllers;
    constructor(controllers) {
        // create express application:
        this.app = (0, express_1.default)();
        // Serve favicon.ico:
        try {
            this.app.use((0, serve_favicon_1.default)(path_1.default.join(__dirname, "../favicon.ico")));
        }
        catch (error) {
            console.log(error.message);
        }
        this.controllers = controllers;
    }
    // public listen(port: string): void {
    //     this.app.listen(port, () => {
    //         console.log(`App listening on the port ${port}`);
    //     });
    // }
    // only use in tests
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        // Swagger
        const options = {
            swaggerOptions: {
                // docExpansion: "list",
                displayRequestDuration: true,
                // defaultModelsExpandDepth: 3,
                // defaultModelExpandDepth: 3,
                tryItOutEnabled: true,
                // showCommonExtensions: true,
                // filter: true,
            },
        };
        this.app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, options));
        this.app.use(express_1.default.json()); // body-parser middleware, for read requests body
        this.app.use((0, cookie_parser_1.default)()); // cookie-parser middleware, for read requests cookies
        // Enabled CORS (Cross-Origin Resource Sharing):
        this.app.use((0, cors_1.default)({
            origin: [
                "https://minimal-dialogs.netlify.app",
                "https://jedlik-vite-quasar-template.netlify.app",
                "https://jedlik-vite-ts-template.netlify.app",
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "http://localhost:9000",
                "http://127.0.0.1:9000",
            ],
            credentials: true,
        }));
        this.app.set("trust proxy", 1); // trust first proxy (If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express)
        // Session management:
        // https://javascript.plainenglish.io/session-management-in-a-nodejs-express-app-with-mongodb-19f52c392dad
        // session options for deployment:
        const mySessionOptions = {
            secret: process.env.SESSION_SECRET,
            rolling: true,
            resave: true,
            saveUninitialized: false,
            cookie: { secure: true, httpOnly: true, sameSite: "none", maxAge: 1000 * 60 * +process.env.MAX_AGE_MIN },
            unset: "destroy",
            store: connect_mongo_1.default.create({
                mongoUrl: process.env.MONGO_URI,
                dbName: process.env.MONGO_DB,
                stringify: false,
            }),
        };
        // modify session options for development:
        if (["development", "test"].includes(process.env.NODE_ENV)) {
            mySessionOptions.cookie.secure = false;
            mySessionOptions.cookie.sameSite = "lax";
        }
        this.app.use((0, express_session_1.default)(mySessionOptions));
        // Morgan logger:
        if (["development", "test"].includes(process.env.NODE_ENV))
            this.app.use((0, morgan_1.default)(":method :url status=:status :date[iso] rt=:response-time ms"));
        if (process.env.NODE_ENV == "deployment")
            this.app.use((0, morgan_1.default)("tiny"));
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
    initializeControllers(controllers) {
        controllers.forEach(controller => {
            this.app.use("/", controller.router);
        });
    }
    // const connectToTheDatabase(controllers: IController[]): Promise<string> = new Promise((resolve, reject) =>{});
    async connectToTheDatabase(port) {
        return new Promise((resolve, reject) => {
            // execute some code here
            (0, dotenv_1.config)(); // Read and set variables from .env file (only during development).
            const { MONGO_URI, MONGO_DB, PORT } = process.env;
            mongoose_1.default.set("strictQuery", true); // for disable DeprecationWarning
            mongoose_1.default.connect(MONGO_URI, { dbName: MONGO_DB }).catch(error => console.log(`Mongoose error on connection! Message: ${error.message}`));
            mongoose_1.default.connection.on("error", error => {
                // console.log(`Mongoose error message: ${error.message}`);
                reject(`Mongoose error message: ${error.message}`);
            });
            mongoose_1.default.connection.on("connected", () => {
                // console.log("Connected to MongoDB server.");
                this.initializeMiddlewares();
                this.initializeControllers(this.controllers);
                this.initializeErrorHandling();
                // this.listen();
                if (!port)
                    port = PORT;
                this.app.listen(port, () => {
                    console.log(`App listening on the port ${port}`);
                });
                resolve("Connected to MongoDB server.");
            });
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map