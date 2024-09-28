// import { Router } from "express";
import serverless from "serverless-http";

// const api = express();
// const router = Router();
// router.get("/hello", (req, res) => res.send("Hello World!"));
// api.use("/api/", router);
// export const handler = serverless(api); // api
import App from "../../src/_app";
import AuthenticationController from "../../src/authentication/_authentication.controller";
import AuthorController from "../../src/authentication/_authentication.controller";
import PostController from "../../src/post/_post.controller";
import RecipeController from "../../src/recipe/_recipe.controller";
import ReportController from "../../src/report/_report.controller";
import UserController from "../../src/user/_user.controller";

const api: App = new App([
    new AuthenticationController(),
    new UserController(),
    new PostController(),
    new RecipeController(),
    new AuthorController(),
    new ReportController(),
]);

export const handler = serverless(api.getServer());
