import {body, query} from "express-validator";
import { Error } from "mongoose";
import User from "../models/User";
export class UserValidators{
    static signup(){
        return [
        body( 'username','USERNAME IS REQUIREED!').isString(),
        body('email','Email is  Required!').isEmail().custom((email,{req})=>{
            console.log(req.body);
           return User.findOne({email:email}).then(user=>{
    
                if(user){
                    throw new Error('User Already Exists!');
                }
                else{
                    return true;
                }
            })
        }),
        body('password','Password is required!').isAlphanumeric().isLength({min:8,max:20}).withMessage('Password can be only 8-20 characters long!')
       ]
    }

    static verifyUser(){
        return [body('verification_token','Verification Token is Required!').isNumeric()
    ]
    }

    static updatePassword(){
        return [body('password','Current Password is required!').isAlphanumeric(),
        body('confirm_password','New Password is required!').isAlphanumeric(),
        body('new_password','Confirm New Password is required!').isAlphanumeric()
        .custom((newPassword,{req})=>{
            if(newPassword === req.body.confirm_password){
                return true;
            }
            else{
                req.errorStatus=422;
                throw new Error('New Password and Confirm New Password does not match!');
            }
        })
    ];
    }

    static login(){
        return [query('email','Email is Required!').isEmail()
        .custom((email,{req})=>{

            return User.findOne({email:email}).then((user)=>{

                if(user){
                    req.user=user;
                    return true;
                }
                else{
                    throw new Error('User does not exist!');

                }
            })
        }),
        query('password','Password is required!').isAlphanumeric()]
    }

    static sendResetPasswordEmail(){
        return [query('email').isEmail().custom((email,{req})=>{
            return User.findOne({email:email}).then((user)=>{
                if(user){
                    return true;
                }else{
                    throw new Error('Email Does Not Exist!');
                }
            });
        })]
    }
    static verifyResetPasswordToken(){

        return [query('reset_password_token','Reset Password Token is Requered!')
        .isNumeric().custom((token,{req})=>{
            return User.findOne({
                reset_password_token:token,
                reset_password_token_time:{$gt:Date.now()}
            }).then((user)=>{
                if(user){
                    return true;
                }else{
                    throw new Error('Token does not exist. Please request a new one!');
                    }
                })
            })
        ]
    }

    static resetPassword(){
        return [body('email','Email is Required!').isEmail()
        .custom((email,{req})=>{

            return User.findOne({email:email}).then((user)=>{

                if(user){
                    req.user=user;
                    return true;
                }
                else{
                    throw new Error('User does not exist!');

                }
            })
        }),body('new_password','New passwod is required!').isAlphanumeric().custom((newPassword,{req})=>{
            if(newPassword===req.body.confirm_password){
                return true;
            }else{
                throw new Error('Confirm New Password and New Password field does not match!');
            }
        }),
        body('confirm_password','Confirm New passwod is required!').isAlphanumeric(),
        body('reset_password_token','Reset Password Token').isNumeric().custom((token,{req})=>{
            
            if(Number(req.user.reset_password_token)===Number(token)){
                return true;
            }else{
                req.errorStatus=422;
                throw new Error('Reset password token is invalid. Please try again');
            }
        })    
        
    ]

    }

    static updateProfilePic(){
        return [body('profile_pic').custom((profilePic,{req})=>{

            if(req.file){

                return true;
            
            }else{
            
                throw new Error('File not uploaded');
            }

        })]
    }
}