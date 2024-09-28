"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _app_1 = tslib_1.__importDefault(require("./_app"));
const _authentication_controller_1 = tslib_1.__importDefault(require("./authentication/_authentication.controller"));
const _post_controller_1 = tslib_1.__importDefault(require("./post/_post.controller"));
const _recipe_controller_1 = tslib_1.__importDefault(require("./recipe/_recipe.controller"));
const _report_controller_1 = tslib_1.__importDefault(require("./report/_report.controller"));
const _user_controller_1 = tslib_1.__importDefault(require("./user/_user.controller"));
const app = new _app_1.default([new _authentication_controller_1.default(), new _user_controller_1.default(), new _post_controller_1.default(), new _recipe_controller_1.default(), new _report_controller_1.default()]);
app.connectToTheDatabase()
    .then(msg => {
    console.log(msg);
})
    .catch(err => {
    console.log(err);
});
module.exports = app.getServer();
//# sourceMappingURL=index.js.map