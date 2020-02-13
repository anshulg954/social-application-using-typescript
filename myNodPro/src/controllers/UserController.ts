import User from "../models/User";
import {validationResult} from "express-validator";
import { Error } from "mongoose";
import { Utils } from "../utils/Utils";
import { NodeMailer } from "../utils/NodeMailer";
import * as Bcrypt from "bcrypt";
import { resolve } from "dns";
import * as Jwt from "jsonwebtoken";
import { userInfo } from "os";
import { getEnvironmentVariables } from "../environments/env";
export class UserController{

    static async signup(req,res,next){
       const email=req.body.email;
       const password=req.body.password;
       const username=req.body.username;
       const verificationToken=Utils.generateVerificationToken();
       
         try{
            const hash=await Utils.encryptPassword(password);
            
            await Bcrypt.hash(password,10,(async(err,hash)=>{
                if(err){
                    next(err);
                    return;
                }
                const data={
                    email: email,
                    password: hash,
                    username: username,
                    verification_token: verificationToken,
                    verification_token_time:Date.now()+new Utils().MAX_TOKEN_TIME,
                    created_at:new Date(),
                    updated_at:new Date()
                 };
                 let user = await new User(data).save();
                 //SEND VERIFICATION E-MAIL
                  res.send('Added new User!');
                  await NodeMailer.sendEmail(
                  {
                  to:['anshulphy.india@gmail.com'],
                  subject:'SignUp-Email-Verification',
                  html:`<h1>THIS IS YOUR LUCKY NEW YEAR TOKEN ${verificationToken} HAPPY NEW YEAR 2020!</h1><br><h4>~Presented to you by: Anshul Gupta (MEAN STACK DEVELOPER)</h4>`
                  }) 
              }))
        }catch(e){  
            next(e);
       }
}


    static async verify(req,res,next){
        const verificationToken=req.body.verification_token;
        const email= req.user.email;
       try{
            const user = await User.findOneAndUpdate({
           email:email, 
            verification_token:verificationToken, 
            verification_token_time:{$lt:Date.now()}},
            {verified:true,verifiedAt:Date.now()+new Utils().MAX_TOKEN_TIME},
            {new:true});
            if(user){
                res.send(user);
            }else{
                throw new Error('OTP EXPIRED! Kindly, request a new one...')
            }
         }catch(e){
           next(e);
        }

    }

    static async resendVerificationEmail(req,res,next){

        const email=req.user.email;
        const verificationToken= Utils.generateVerificationToken();
        try{
            const user:any=await User.findOneAndUpdate({email:email},{
                verification_token: verificationToken,
                verification_token_time:Date.now()+new Utils().MAX_TOKEN_TIME
            });
            if (user) {
                NodeMailer.sendEmail(
                    {
                        to:[user.email],
                        subject:'Email-Verification',
                        html:`<h1>THIS IS YOUR LUCKY NEW YEAR TOKEN ${verificationToken} HAPPY NEW YEAR 2020!</h1><br><h4>~Presented to you by: Anshul Gupta (MEAN STACK DEVELOPER)</h4>`
                     });
                     res.json({
                         success: true
                     });
            }else {
                throw new Error('User Does Not Exist');
            }   
        }catch(e){
            next(e);
        }
    }

    static async test (req,res,next){
        const email=req.query.email;
        const password=req.query.password;
        User.findOne({email:email}).then((user:any)=>{

            Bcrypt.compare(password,user.password,((err,same)=>{
                res.send(same);
            }))
        })
    }
    static async login(req,res,next){
        const password=req.query.password;
        const user=req.user;
        try{
                await Utils.comparePassword({
                plainPassword: password,
                encryptedPassword: user.password    
                });
                const token=Jwt.sign({email:user.email, user_id:user._id},getEnvironmentVariables().jwt_secret,{expiresIn:'120d'});
                const data={user:user,
                token:token
                };
                res.json(data); 
        }catch(e){
            next(e);
        }
    }
        static async updatePassword(req,res,next){
            const user_id=req.user.user_id;
            const password=req.body.password;
            const confirmPassword=req.body.confirm_password;
            const newPassword=req.body.new_password;
            try{
               const user:any =await User.findOne({_id:user_id});
                await Utils.comparePassword({
                  plainPassword:password,
                  encryptedPassword: user.password
              })
              
          const encryptedPassword=await Utils.encryptPassword(newPassword);
          const newUser= await User.findOneAndUpdate({_id:user_id},{password:encryptedPassword},{new:true});
           res.send(newUser);
         }
         catch(e){
                next(e);
            }
        }
    static async sendResetPasswordEmail(req,res,next){
        const email=req.query.email;
        const resetPasswordToken=Utils.generateVerificationToken();
        try{
            const updatedUser=await User.findOneAndUpdate(
                {email:email},
               {
                updated_at:new Date(),reset_password_token:resetPasswordToken,
                reset_password_token_time:Date.now()+new Utils().MAX_TOKEN_TIME
                },
                {new:true});
            res.send(updatedUser);
        await NodeMailer.sendEmail(
            {
                to:[email],
                subject:'Reset Password Email',
                html:`<h1>${resetPasswordToken}</h1>`
            })
        }catch(e){
            next(e);
        }
    }

    static verifyResetPasswordToken(req,res,next){
        res.json({
            success:true
        })
    }

    static async resetPassword(req,res,next){
        const user=req.user;
        const newPassword=req.body.new_password;
        try{
            const encryptedPassword=await Utils.encryptPassword(newPassword);
            const updatedUser=await User.findOneAndUpdate({_id:user._id},{
                updated_at:new Date(),
                password:encryptedPassword
            },{new:true});
            res.send(updatedUser);
        }catch(e){
            next(e);
        }
    }

    static async updateProfilePic(req,res,next){
        const userId=req.user.user_id;
        const fileUrl='http://localhost:5000'+req.file.path;
           try {
           const user= await User.findByIdAndUpdate({_id:userId},{
                updated_at:new Date(),
                profile_pic_url:fileUrl
            },{new:true});
            res.send(user);
           } catch (e) {
               next(e);
           }
    }
}