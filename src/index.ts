import App from "./_app";
import AuthenticationController from "./authentication/_authentication.controller";
import PostController from "./post/_post.controller";
import RecipeController from "./recipe/_recipe.controller";
import ReportController from "./report/_report.controller";
import UserController from "./user/_user.controller";

const app = new App([new AuthenticationController(), new UserController(), new PostController(), new RecipeController(), new ReportController()]);

app.connectToTheDatabase()
    .then(msg => {
        console.log(msg);
    })
    .catch(err => {
        console.log(err);
    });

module.exports = app.getServer();
