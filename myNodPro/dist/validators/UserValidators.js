"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
class UserValidators {
    static signup() {
        return [
            express_validator_1.body('username', 'USERNAME IS REQUIREED!').isString(),
            express_validator_1.body('email', 'Email is  Required!').isEmail().custom((email, { req }) => {
                console.log(req.body);
                return User_1.default.findOne({ email: email }).then(user => {
                    if (user) {
                        throw new mongoose_1.Error('User Already Exists!');
                    }
                    else {
                        return true;
                    }
                });
            }),
            express_validator_1.body('password', 'Password is required!').isAlphanumeric().isLength({ min: 8, max: 20 }).withMessage('Password can be only 8-20 characters long!')
        ];
    }
    static verifyUser() {
        return [express_validator_1.body('verification_token', 'Verification Token is Required!').isNumeric()
        ];
    }
    static updatePassword() {
        return [express_validator_1.body('password', 'Current Password is required!').isAlphanumeric(),
            express_validator_1.body('confirm_password', 'New Password is required!').isAlphanumeric(),
            express_validator_1.body('new_password', 'Confirm New Password is required!').isAlphanumeric()
                .custom((newPassword, { req }) => {
                if (newPassword === req.body.confirm_password) {
                    return true;
                }
                else {
                    req.errorStatus = 422;
                    throw new mongoose_1.Error('New Password and Confirm New Password does not match!');
                }
            })
        ];
    }
    static login() {
        return [express_validator_1.query('email', 'Email is Required!').isEmail()
                .custom((email, { req }) => {
                return User_1.default.findOne({ email: email }).then((user) => {
                    if (user) {
                        req.user = user;
                        return true;
                    }
                    else {
                        throw new mongoose_1.Error('User does not exist!');
                    }
                });
            }),
            express_validator_1.query('password', 'Password is required!').isAlphanumeric()];
    }
    static sendResetPasswordEmail() {
        return [express_validator_1.query('email').isEmail().custom((email, { req }) => {
                return User_1.default.findOne({ email: email }).then((user) => {
                    if (user) {
                        return true;
                    }
                    else {
                        throw new mongoose_1.Error('Email Does Not Exist!');
                    }
                });
            })];
    }
    static verifyResetPasswordToken() {
        return [express_validator_1.query('reset_password_token', 'Reset Password Token is Requered!')
                .isNumeric().custom((token, { req }) => {
                return User_1.default.findOne({
                    reset_password_token: token,
                    reset_password_token_time: { $gt: Date.now() }
                }).then((user) => {
                    if (user) {
                        return true;
                    }
                    else {
                        throw new mongoose_1.Error('Token does not exist. Please request a new one!');
                    }
                });
            })
        ];
    }
    static resetPassword() {
        return [express_validator_1.body('email', 'Email is Required!').isEmail()
                .custom((email, { req }) => {
                return User_1.default.findOne({ email: email }).then((user) => {
                    if (user) {
                        req.user = user;
                        return true;
                    }
                    else {
                        throw new mongoose_1.Error('User does not exist!');
                    }
                });
            }), express_validator_1.body('new_password', 'New passwod is required!').isAlphanumeric().custom((newPassword, { req }) => {
                if (newPassword === req.body.confirm_password) {
                    return true;
                }
                else {
                    throw new mongoose_1.Error('Confirm New Password and New Password field does not match!');
                }
            }),
            express_validator_1.body('confirm_password', 'Confirm New passwod is required!').isAlphanumeric(),
            express_validator_1.body('reset_password_token', 'Reset Password Token').isNumeric().custom((token, { req }) => {
                if (Number(req.user.reset_password_token) === Number(token)) {
                    return true;
                }
                else {
                    req.errorStatus = 422;
                    throw new mongoose_1.Error('Reset password token is invalid. Please try again');
                }
            })
        ];
    }
    static updateProfilePic() {
        return [express_validator_1.body('profile_pic').custom((profilePic, { req }) => {
                if (req.file) {
                    return true;
                }
                else {
                    throw new mongoose_1.Error('File not uploaded');
                }
            })];
    }
}
exports.UserValidators = UserValidators;
