"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = tslib_1.__importDefault(require("./app"));
const authentication_controller_1 = tslib_1.__importDefault(require("./authentication/authentication.controller"));
const post_controller_1 = tslib_1.__importDefault(require("./post/post.controller"));
const recipe_controller_1 = tslib_1.__importDefault(require("./recipe/recipe.controller"));
const report_controller_1 = tslib_1.__importDefault(require("./report/report.controller"));
const user_controller_1 = tslib_1.__importDefault(require("./user/user.controller"));
const app = new app_1.default([new authentication_controller_1.default(), new user_controller_1.default(), new post_controller_1.default(), new recipe_controller_1.default(), new report_controller_1.default()]);
app.connectToTheDatabase()
    .then(msg => {
    console.log(msg);
})
    .catch(err => {
    console.log(err);
});
module.exports = app;
//# sourceMappingURL=index.js.map