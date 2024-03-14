import App from "./app";
import AuthenticationController from "./authentication/authentication.controller";
import PostController from "./post/post.controller";
import RecipeController from "./recipe/recipe.controller";
import ReportController from "./report/report.controller";
import UserController from "./user/user.controller";

const app = new App([new AuthenticationController(), new UserController(), new PostController(), new RecipeController(), new ReportController()]);

app.connectToTheDatabase
    .then(msg => {
        console.log(msg);
    })
    .catch(err => {
        console.log(err);
    });
