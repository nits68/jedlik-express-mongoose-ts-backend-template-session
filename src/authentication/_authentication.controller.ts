import sgMail from "@sendgrid/mail";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { NextFunction, Request, Response, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { Schema } from "mongoose";

import HttpException from "../exceptions/_Http.exception";
import UserWithThatEmailAlreadyExistsException from "../exceptions/_UserWithThatEmailAlreadyExists.exception";
import WrongCredentialsException from "../exceptions/_WrongCredentials.exception";
import IController from "../interfaces/_controller.interface";
import IGoogleUserInfo from "../interfaces/_googleUserInfo.interface";
import IRequestWithUser from "../interfaces/_requestWithUser.interface";
import ISession from "../interfaces/_session.interface";
import validationMiddleware from "../middleware/_validation.middleware";
import CreateUserDto from "../user/_user.dto";
import IUser from "../user/_user.interface";
import userModel from "../user/_user.model";
import LogInDto from "./_logIn.dto";
import tokenModel from "./_token.model";

export default class AuthenticationController implements IController {
    public path = "/auth";
    public router = Router();
    private user = userModel;
    private token = tokenModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", (req: Request, res: Response) => {
            res.send(
                "Jedlik-Express-Mongoose-TS-Session-Backend API - Swagger: <a href='https://jedliksession.cyclic.app/docs'>https://jedliksession.cyclic.app/docs</a>",
            );
        });
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.login);
        this.router.post(`${this.path}/autologin`, this.autoLogin);
        this.router.post(`${this.path}/closeapp`, this.closeApp);
        this.router.post(`${this.path}/logout`, this.logout);
        this.router.post(`${this.path}/google`, this.loginAndRegisterWithGoogle);
        this.router.get(`${this.path}/confirmation/:email/:token`, this.confirmEmail);
        this.router.get(`${this.path}/resend/:email`, this.resendLink);
    }

    // LINK ./authentication.controller.yml#login
    // ANCHOR[id=login]
    private login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const logInData: IUser = req.body;
            const user = await this.user.findOne({ email: logInData.email });
            if (user) {
                const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
                if (isPasswordMatching) {
                    user.password = undefined;
                    if (!user.email_verified) {
                        next(new HttpException(401, "Your Email has not been verified. Please click on resend!"));
                    } else {
                        req.session.regenerate(error => {
                            if (error) {
                                next(new HttpException(400, error.message)); // to do
                            }
                            console.log("regenerate ok");
                            (req.session as ISession).user_id = user._id as Schema.Types.ObjectId;
                            (req.session as ISession).user_email = user.email;
                            (req.session as ISession).isLoggedIn = true;
                            (req.session as ISession).isAutoLogin = user.auto_login;
                            (req.session as ISession).roles = user.roles;
                            res.send(user);
                        });
                    }
                } else {
                    next(new WrongCredentialsException());
                }
            } else {
                next(new WrongCredentialsException());
            }
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./authentication.controller.yml#registration
    // ANCHOR[id=registration]
    private registration = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: IUser = req.body;
            if (await this.user.findOne({ email: userData.email })) {
                next(new UserWithThatEmailAlreadyExistsException(userData.email));
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 10);

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
                const token: string = crypto.randomBytes(16).toString("hex");
                // save token in MongoDB, see token.model.ts:
                await this.token
                    .create({
                        _userId: user._id,
                        token: token,
                    })
                    .catch(error => {
                        next(new HttpException(500, error.message));
                    });

                sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                const confirmURL: string = `${process.env.BACKEND_API}/auth/confirmation/${user.email}/${token}`;

                const msg = {
                    to: user.email, // Change to your recipient
                    from: "nits.laszlo@cspk.hu", // Change to your verified sender
                    subject: "Confirm your e-mail address",
                    text: `Dear ${userData.name}! Click on the following link to confirm your email address:  ${confirmURL}`,
                    // eslint-disable-next-line max-len
                    html: `<h3>Dear ${userData.name}!</h3><p>Click on the following link to confirm your email address: <a href="${confirmURL}">CONFIRM!</a></p>`,
                };

                await sgMail
                    .send(msg)
                    .then(response => {
                        next(
                            new HttpException(response[0].statusCode, `A verification e-mail has been sent to ${user.email}, It will be expire after one day.`),
                        );
                    })
                    .catch(error => {
                        console.error(error);
                        next(new HttpException(400, error));
                    });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private confirmEmail = (req: Request, res: Response, next: NextFunction) => {
        try {
            this.token
                .findOne({ token: req.params.token })
                .then(token => {
                    if (!token) {
                        next(new HttpException(401, "We were unable to find a user for this verification. Please SignUp!"));
                    } else {
                        this.user.findOne({ _id: token._userId, email: req.params.email }).then(user => {
                            if (!user) {
                                next(new HttpException(401, "We were unable to find a user for this verification. Please SignUp!"));
                            } else if (user.email_verified) {
                                next(new HttpException(200, "User has been already verified. Please Login!"));
                            } else {
                                // change email_verified to true
                                this.user
                                    .findByIdAndUpdate(user._id, { email_verified: true })
                                    .then(() => {
                                        next(new HttpException(200, "Your account has been successfully verified"));
                                    })
                                    .catch(error => {
                                        next(new HttpException(500, error.mesage));
                                    });
                            }
                        });
                    }
                })
                .catch(error => {
                    console.log(error.message);
                });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private resendLink = (req: Request, res: Response, next: NextFunction) => {
        try {
            this.user.findOne({ email: req.params.email }).then(user => {
                if (!user) {
                    next(new HttpException(400, "We were unable to find a user with that email. Make sure your Email is correct!"));
                } else if (user.email_verified) {
                    next(new HttpException(200, "This account has been already verified. Please log in."));
                } else {
                    // create token:
                    const token: string = crypto.randomBytes(16).toString("hex");
                    // save token in MongoDB, see token.model.ts:
                    this.token
                        .create({
                            _userId: user._id,
                            token: token,
                        })
                        .catch(error => {
                            next(new HttpException(500, error.message));
                        });

                    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                    const confirmURL: string = `${process.env.BACKEND_API}/auth/confirmation/${user.email}/${token}`;

                    const msg = {
                        to: user.email, // Change to your recipient
                        from: "nits.laszlo@cspk.hu", // Change to your verified sender
                        subject: "Confirm your e-mail address",
                        text: `Dear ${user.name}! Click on the following link to confirm your email address:  ${confirmURL}`,
                        // eslint-disable-next-line max-len
                        html: `<h3>Dear ${user.name}!</h3><p>Click on the following link to confirm your email address: <a href="${confirmURL}">CONFIRM!</a></p>`,
                    };

                    sgMail
                        .send(msg)
                        .then(response => {
                            next(
                                new HttpException(
                                    response[0].statusCode,
                                    `A verification e-mail has been sent to ${user.email}, It will be expire after one day.`,
                                ),
                            );
                        })
                        .catch(error => {
                            console.error(error);
                            next(new HttpException(400, error));
                        });
                }
            });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private autoLogin = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        if (req.session.id && (req.session as ISession).isAutoLogin) {
            const user: IUser = await userModel.findById((req.session as ISession).user_id);
            if (user) {
                (req.session as ISession).isLoggedIn = true;
                res.send(user);
            } else {
                next(new HttpException(404, "Please log in!"));
            }
        } else {
            next(new HttpException(404, "Please log in!"));
        }
    };

    private closeApp = (req: Request, res: Response) => {
        if (req.session.id && (req.session as ISession).isAutoLogin) {
            (req.session as ISession).isLoggedIn = false;
            res.sendStatus(200);
        } else this.logout(req, res);
    };

    private logout = (req: Request, res: Response) => {
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
                } else {
                    console.log("Session is destroyed!");
                }
            });
        }
        res.sendStatus(200);
    };

    private loginAndRegisterWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const client: OAuth2Client = new OAuth2Client();
            const verifyToken = async (token: string) => {
                client.setCredentials({ access_token: token });
                const userinfo = await client.request({
                    url: "https://www.googleapis.com/oauth2/v3/userinfo",
                });
                return userinfo.data;
            };

            verifyToken(req.body.atoken)
                .then(userInfo => {
                    const googleUser = userInfo as IGoogleUserInfo;
                    this.user.findOne({ email: googleUser.email }).then(user => {
                        if (user) {
                            req.session.regenerate(error => {
                                if (error) {
                                    next(new HttpException(400, error.message)); // to do
                                }
                                console.log("regenerate ok");
                                (req.session as ISession).user_id = user._id as Schema.Types.ObjectId;
                                (req.session as ISession).user_email = user.email as string;
                                (req.session as ISession).isLoggedIn = true;
                                (req.session as ISession).isAutoLogin = user.auto_login;
                                (req.session as ISession).roles = user.roles;
                                res.send(user);
                            });
                        } else {
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
                                            next(new HttpException(400, error.message)); // to do
                                        }
                                        (req.session as ISession).user_id = user._id as Schema.Types.ObjectId;
                                        (req.session as ISession).user_email = user.email as string;
                                        (req.session as ISession).isLoggedIn = true;
                                        (req.session as ISession).isAutoLogin = user.auto_login;
                                        (req.session as ISession).roles = user.roles;
                                        res.send(user);
                                    });
                                });
                        }
                    });
                })
                .catch(() => {
                    next(new WrongCredentialsException());
                });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
