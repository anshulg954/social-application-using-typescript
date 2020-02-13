"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
const Utils_1 = require("../utils/Utils");
const NodeMailer_1 = require("../utils/NodeMailer");
const Bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const env_1 = require("../environments/env");
class UserController {
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.body.email;
            const password = req.body.password;
            const username = req.body.username;
            const verificationToken = Utils_1.Utils.generateVerificationToken();
            try {
                const hash = yield Utils_1.Utils.encryptPassword(password);
                yield Bcrypt.hash(password, 10, ((err, hash) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        next(err);
                        return;
                    }
                    const data = {
                        email: email,
                        password: hash,
                        username: username,
                        verification_token: verificationToken,
                        verification_token_time: Date.now() + new Utils_1.Utils().MAX_TOKEN_TIME,
                        created_at: new Date(),
                        updated_at: new Date()
                    };
                    let user = yield new User_1.default(data).save();
                    //SEND VERIFICATION E-MAIL
                    res.send('Added new User!');
                    yield NodeMailer_1.NodeMailer.sendEmail({
                        to: ['anshulphy.india@gmail.com'],
                        subject: 'SignUp-Email-Verification',
                        html: `<h1>THIS IS YOUR LUCKY NEW YEAR TOKEN ${verificationToken} HAPPY NEW YEAR 2020!</h1><br><h4>~Presented to you by: Anshul Gupta (MEAN STACK DEVELOPER)</h4>`
                    });
                })));
            }
            catch (e) {
                next(e);
            }
        });
    }
    static verify(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationToken = req.body.verification_token;
            const email = req.user.email;
            try {
                const user = yield User_1.default.findOneAndUpdate({
                    email: email,
                    verification_token: verificationToken,
                    verification_token_time: { $lt: Date.now() }
                }, { verified: true, verifiedAt: Date.now() + new Utils_1.Utils().MAX_TOKEN_TIME }, { new: true });
                if (user) {
                    res.send(user);
                }
                else {
                    throw new mongoose_1.Error('OTP EXPIRED! Kindly, request a new one...');
                }
            }
            catch (e) {
                next(e);
            }
        });
    }
    static resendVerificationEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.user.email;
            const verificationToken = Utils_1.Utils.generateVerificationToken();
            try {
                const user = yield User_1.default.findOneAndUpdate({ email: email }, {
                    verification_token: verificationToken,
                    verification_token_time: Date.now() + new Utils_1.Utils().MAX_TOKEN_TIME
                });
                if (user) {
                    NodeMailer_1.NodeMailer.sendEmail({
                        to: [user.email],
                        subject: 'Email-Verification',
                        html: `<h1>THIS IS YOUR LUCKY NEW YEAR TOKEN ${verificationToken} HAPPY NEW YEAR 2020!</h1><br><h4>~Presented to you by: Anshul Gupta (MEAN STACK DEVELOPER)</h4>`
                    });
                    res.json({
                        success: true
                    });
                }
                else {
                    throw new mongoose_1.Error('User Does Not Exist');
                }
            }
            catch (e) {
                next(e);
            }
        });
    }
    static test(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.query.email;
            const password = req.query.password;
            User_1.default.findOne({ email: email }).then((user) => {
                Bcrypt.compare(password, user.password, ((err, same) => {
                    res.send(same);
                }));
            });
        });
    }
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const password = req.query.password;
            const user = req.user;
            try {
                yield Utils_1.Utils.comparePassword({
                    plainPassword: password,
                    encryptedPassword: user.password
                });
                const token = Jwt.sign({ email: user.email, user_id: user._id }, env_1.getEnvironmentVariables().jwt_secret, { expiresIn: '120d' });
                const data = { user: user,
                    token: token
                };
                res.json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
    static updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_id = req.user.user_id;
            const password = req.body.password;
            const confirmPassword = req.body.confirm_password;
            const newPassword = req.body.new_password;
            try {
                const user = yield User_1.default.findOne({ _id: user_id });
                yield Utils_1.Utils.comparePassword({
                    plainPassword: password,
                    encryptedPassword: user.password
                });
                const encryptedPassword = yield Utils_1.Utils.encryptPassword(newPassword);
                const newUser = yield User_1.default.findOneAndUpdate({ _id: user_id }, { password: encryptedPassword }, { new: true });
                res.send(newUser);
            }
            catch (e) {
                next(e);
            }
        });
    }
    static sendResetPasswordEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.query.email;
            const resetPasswordToken = Utils_1.Utils.generateVerificationToken();
            try {
                const updatedUser = yield User_1.default.findOneAndUpdate({ email: email }, {
                    updated_at: new Date(), reset_password_token: resetPasswordToken,
                    reset_password_token_time: Date.now() + new Utils_1.Utils().MAX_TOKEN_TIME
                }, { new: true });
                res.send(updatedUser);
                yield NodeMailer_1.NodeMailer.sendEmail({
                    to: [email],
                    subject: 'Reset Password Email',
                    html: `<h1>${resetPasswordToken}</h1>`
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static verifyResetPasswordToken(req, res, next) {
        res.json({
            success: true
        });
    }
    static resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const newPassword = req.body.new_password;
            try {
                const encryptedPassword = yield Utils_1.Utils.encryptPassword(newPassword);
                const updatedUser = yield User_1.default.findOneAndUpdate({ _id: user._id }, {
                    updated_at: new Date(),
                    password: encryptedPassword
                }, { new: true });
                res.send(updatedUser);
            }
            catch (e) {
                next(e);
            }
        });
    }
    static updateProfilePic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.user_id;
            const fileUrl = 'http://localhost:5000' + req.file.path;
            try {
                const user = yield User_1.default.findByIdAndUpdate({ _id: userId }, {
                    updated_at: new Date(),
                    profile_pic_url: fileUrl
                }, { new: true });
                res.send(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.UserController = UserController;
