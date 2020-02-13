import * as express from "express";
import { getEnvironmentVariables } from "./environments/env";
import * as mongoose from "mongoose";
import UserRouter from "./routers/UserRouter";
import bodyParser = require("body-parser");
import PostRouter from "./routers/PostRouter";
import CommentRouter from "./routers/CommentRouter";
import { Jobs } from "./jobs/Jobs";
export class Server{

    public app:express.Application = express();
    constructor(){
        this.setConfigurations();
        this.setRoutes();
        this.error404Handler();
        this.handleErrors();
    }
    setConfigurations(){
        this.connectMongoDb();
        this.configureBodyParser();
      
    }
    connectMongoDb(){
        const databaseUrl = getEnvironmentVariables().db_url;
        const MongoClient = require('mongodb').MongoClient;
        const uri = "mongodb+srv://anshulgupta:anshulgupta@mycluster-v6kvk.mongodb.net/test?retryWrites=true&w=majority";
         mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
}
    configureBodyParser(){
        this.app.use(bodyParser.urlencoded({extended: true}));
    }
    setRoutes(){
    this.app.use('/src/uploads',express.static('src/uploads'));
    this.app.use('/api/user/',UserRouter);
    this.app.use('/api/post',PostRouter);
    this.app.use('/api/comment',CommentRouter);
    }
    error404Handler(){
        this.app.use((req,res)=>{
            res.status(404).json({
                message:'Page Not Found!',
                status_code: 404
            });
        })
    }
    handleErrors(){
        this.app.use((error,req,res,next)=>{

            const errorStatus=req.errorStatus||500;

            res.status(errorStatus).json({

                message: error.message||'   Something Went Wrong!',
                status_code: errorStatus
            });   
        })
    }
}