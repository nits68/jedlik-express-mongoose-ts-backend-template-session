"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mail_1 = tslib_1.__importDefault(require("@sendgrid/mail"));
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const Http_exception_1 = tslib_1.__importDefault(require("../exceptions/Http.exception"));
const UserWithThatEmailAlreadyExists_exception_1 = tslib_1.__importDefault(require("../exceptions/UserWithThatEmailAlreadyExists.exception"));
const WrongCredentials_exception_1 = tslib_1.__importDefault(require("../exceptions/WrongCredentials.exception"));
const validation_middleware_1 = tslib_1.__importDefault(require("../middleware/validation.middleware"));
const user_dto_1 = tslib_1.__importDefault(require("../user/user.dto"));
const user_model_1 = tslib_1.__importDefault(require("../user/user.model"));
const logIn_dto_1 = tslib_1.__importDefault(require("./logIn.dto"));
const token_model_1 = tslib_1.__importDefault(require("./token.model"));
class AuthenticationController {
    path = "/auth";
    router = (0, express_1.Router)();
    user = user_model_1.default;
    token = token_model_1.default;
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", (req, res) => {
            res.send("Jedlik-Express-Mongoose-TS-Session-Backend API - Swagger: <a href='https://jedliksession.cyclic.app/docs'>https://jedliksession.cyclic.app/docs</a>");
        });
        this.router.post(`${this.path}/register`, (0, validation_middleware_1.default)(user_dto_1.default), this.registration);
        this.router.post(`${this.path}/login`, (0, validation_middleware_1.default)(logIn_dto_1.default), this.login);
        this.router.post(`${this.path}/autologin`, this.autoLogin);
        this.router.post(`${this.path}/closeapp`, this.closeApp);
        this.router.post(`${this.path}/logout`, this.logout);
        this.router.post(`${this.path}/google`, this.loginAndRegisterWithGoogle);
        this.router.get(`${this.path}/confirmation/:email/:token`, this.confirmEmail);
        this.router.get(`${this.path}/resend/:email`, this.resendLink);
    }
    // LINK ./authentication.controller.yml#login
    // ANCHOR[id=login]
    login = async (req, res, next) => {
        try {
            const logInData = req.body;
            const user = await this.user.findOne({ email: logInData.email });
            if (user) {
                const isPasswordMatching = await bcrypt_1.default.compare(logInData.password, user.password);
                if (isPasswordMatching) {
                    user.password = undefined;
                    if (!user.email_verified) {
                        next(new Http_exception_1.default(401, "Your Email has not been verified. Please click on resend!"));
                    }
                    else {
                        req.session.regenerate(error => {
                            if (error) {
                                next(new Http_exception_1.default(400, error.message)); // to do
                            }
                            console.log("regenerate ok");
                            req.session.user_id = user._id;
                            req.session.user_email = user.email;
                            req.session.isLoggedIn = true;
                            req.session.isAutoLogin = user.auto_login;
                            req.session.roles = user.roles;
                            res.send(user);
                        });
                    }
                }
                else {
                    next(new WrongCredentials_exception_1.default());
                }
            }
            else {
                next(new WrongCredentials_exception_1.default());
            }
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    // LINK ./authentication.controller.yml#registration
    // ANCHOR[id=registration]
    registration = async (req, res, next) => {
        try {
            const userData = req.body;
            if (await this.user.findOne({ email: userData.email })) {
                next(new UserWithThatEmailAlreadyExists_exception_1.default(userData.email));
            }
            else {
                const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
                const user = await this.user.create({
                    ...userData,
                    password: hashedPassword,
                    email_verified: false, // must do email verification
                    auto_login: false,
                    picture: "none",
                    roles: ["user"], // set default role
                });
                user.password = undefined;
                // e-mail verification
                // ====================
                // create token:
                const token = crypto_1.default.randomBytes(16).toString("hex");
                // save token in MongoDB, see token.model.ts:
                await this.token
                    .create({
                    _userId: user._id,
                    token: token,
                })
                    .catch(error => {
                    next(new Http_exception_1.default(500, error.message));
                });
                mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
                const confirmURL = `${process.env.BACKEND_API}/auth/confirmation/${user.email}/${token}`;
                const msg = {
                    to: user.email, // Change to your recipient
                    from: "nits.laszlo@cspk.hu", // Change to your verified sender
                    subject: "Confirm your e-mail address",
                    text: `Dear ${userData.name}! Click on the following link to confirm your email address:  ${confirmURL}`,
                    // eslint-disable-next-line max-len
                    html: `<h3>Dear ${userData.name}!</h3><p>Click on the following link to confirm your email address: <a href="${confirmURL}">CONFIRM!</a></p>`,
                };
                await mail_1.default
                    .send(msg)
                    .then(response => {
                    next(new Http_exception_1.default(response[0].statusCode, `A verification e-mail has been sent to ${user.email}, It will be expire after one day.`));
                })
                    .catch(error => {
                    console.error(error);
                    next(new Http_exception_1.default(400, error));
                });
            }
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    confirmEmail = (req, res, next) => {
        try {
            this.token
                .findOne({ token: req.params.token })
                .then(token => {
                if (!token) {
                    next(new Http_exception_1.default(401, "We were unable to find a user for this verification. Please SignUp!"));
                }
                else {
                    this.user.findOne({ _id: token._userId, email: req.params.email }).then(user => {
                        if (!user) {
                            next(new Http_exception_1.default(401, "We were unable to find a user for this verification. Please SignUp!"));
                        }
                        else if (user.email_verified) {
                            next(new Http_exception_1.default(200, "User has been already verified. Please Login!"));
                        }
                        else {
                            // change email_verified to true
                            this.user
                                .findByIdAndUpdate(user._id, { email_verified: true })
                                .then(() => {
                                next(new Http_exception_1.default(200, "Your account has been successfully verified"));
                            })
                                .catch(error => {
                                next(new Http_exception_1.default(500, error.mesage));
                            });
                        }
                    });
                }
            })
                .catch(error => {
                console.log(error.message);
            });
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    resendLink = (req, res, next) => {
        try {
            this.user.findOne({ email: req.params.email }).then(user => {
                if (!user) {
                    next(new Http_exception_1.default(400, "We were unable to find a user with that email. Make sure your Email is correct!"));
                }
                else if (user.email_verified) {
                    next(new Http_exception_1.default(200, "This account has been already verified. Please log in."));
                }
                else {
                    // create token:
                    const token = crypto_1.default.randomBytes(16).toString("hex");
                    // save token in MongoDB, see token.model.ts:
                    this.token
                        .create({
                        _userId: user._id,
                        token: token,
                    })
                        .catch(error => {
                        next(new Http_exception_1.default(500, error.message));
                    });
                    mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
                    const confirmURL = `${process.env.BACKEND_API}/auth/confirmation/${user.email}/${token}`;
                    const msg = {
                        to: user.email, // Change to your recipient
                        from: "nits.laszlo@cspk.hu", // Change to your verified sender
                        subject: "Confirm your e-mail address",
                        text: `Dear ${user.name}! Click on the following link to confirm your email address:  ${confirmURL}`,
                        // eslint-disable-next-line max-len
                        html: `<h3>Dear ${user.name}!</h3><p>Click on the following link to confirm your email address: <a href="${confirmURL}">CONFIRM!</a></p>`,
                    };
                    mail_1.default
                        .send(msg)
                        .then(response => {
                        next(new Http_exception_1.default(response[0].statusCode, `A verification e-mail has been sent to ${user.email}, It will be expire after one day.`));
                    })
                        .catch(error => {
                        console.error(error);
                        next(new Http_exception_1.default(400, error));
                    });
                }
            });
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
    autoLogin = async (req, res, next) => {
        if (req.session.id && req.session.isAutoLogin) {
            const user = await user_model_1.default.findById(req.session.user_id);
            if (user) {
                req.session.isLoggedIn = true;
                res.send(user);
            }
            else {
                next(new Http_exception_1.default(404, "Please log in!"));
            }
        }
        else {
            next(new Http_exception_1.default(404, "Please log in!"));
        }
    };
    closeApp = (req, res) => {
        if (req.session.id && req.session.isAutoLogin) {
            req.session.isLoggedIn = false;
            res.sendStatus(200);
        }
        else
            this.logout(req, res);
    };
    logout = (req, res) => {
        if (req.session.cookie) {
            // Clear session cookie on client:
            res.cookie("connect.sid", null, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1,
            });
            // Delete session document from MongoDB:
            req.session.destroy(err => {
                if (err) {
                    console.log("Error at destroyed session");
                }
                else {
                    console.log("Session is destroyed!");
                }
            });
        }
        res.sendStatus(200);
    };
    loginAndRegisterWithGoogle = async (req, res, next) => {
        try {
            const client = new google_auth_library_1.OAuth2Client();
            const verifyToken = async (token) => {
                client.setCredentials({ access_token: token });
                const userinfo = await client.request({
                    url: "https://www.googleapis.com/oauth2/v3/userinfo",
                });
                return userinfo.data;
            };
            verifyToken(req.body.atoken)
                .then(userInfo => {
                const googleUser = userInfo;
                this.user.findOne({ email: googleUser.email }).then(user => {
                    if (user) {
                        req.session.regenerate(error => {
                            if (error) {
                                next(new Http_exception_1.default(400, error.message)); // to do
                            }
                            console.log("regenerate ok");
                            req.session.user_id = user._id;
                            req.session.user_email = user.email;
                            req.session.isLoggedIn = true;
                            req.session.isAutoLogin = user.auto_login;
                            req.session.roles = user.roles;
                            res.send(user);
                        });
                    }
                    else {
                        // Register as new Google user
                        this.user
                            .create({
                            ...googleUser,
                            password: "stored at Google",
                            auto_login: true,
                            roles: ["user"], // default role on registration
                        })
                            .then(user => {
                            req.session.regenerate(error => {
                                if (error) {
                                    next(new Http_exception_1.default(400, error.message)); // to do
                                }
                                req.session.user_id = user._id;
                                req.session.user_email = user.email;
                                req.session.isLoggedIn = true;
                                req.session.isAutoLogin = user.auto_login;
                                req.session.roles = user.roles;
                                res.send(user);
                            });
                        });
                    }
                });
            })
                .catch(() => {
                next(new WrongCredentials_exception_1.default());
            });
        }
        catch (error) {
            next(new Http_exception_1.default(400, error.message));
        }
    };
}
exports.default = AuthenticationController;
//# sourceMappingURL=authentication.controller.js.map