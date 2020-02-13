"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const env_1 = require("./environments/env");
const mongoose = require("mongoose");
const UserRouter_1 = require("./routers/UserRouter");
const bodyParser = require("body-parser");
const PostRouter_1 = require("./routers/PostRouter");
const CommentRouter_1 = require("./routers/CommentRouter");
class Server {
    constructor() {
        this.app = express();
        this.setConfigurations();
        this.setRoutes();
        this.error404Handler();
        this.handleErrors();
    }
    setConfigurations() {
        this.connectMongoDb();
        this.configureBodyParser();
    }
    connectMongoDb() {
        const databaseUrl = env_1.getEnvironmentVariables().db_url;
        const MongoClient = require('mongodb').MongoClient;
        const uri = "mongodb+srv://anshulgupta:anshulgupta@mycluster-v6kvk.mongodb.net/test?retryWrites=true&w=majority";
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    }
    configureBodyParser() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }
    setRoutes() {
        this.app.use('/src/uploads', express.static('src/uploads'));
        this.app.use('/api/user/', UserRouter_1.default);
        this.app.use('/api/post', PostRouter_1.default);
        this.app.use('/api/comment', CommentRouter_1.default);
    }
    error404Handler() {
        this.app.use((req, res) => {
            res.status(404).json({
                message: 'Page Not Found!',
                status_code: 404
            });
        });
    }
    handleErrors() {
        this.app.use((error, req, res, next) => {
            const errorStatus = req.errorStatus || 500;
            res.status(errorStatus).json({
                message: error.message || '   Something Went Wrong!',
                status_code: errorStatus
            });
        });
    }
}
exports.Server = Server;
