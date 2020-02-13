import * as express from "express";
import * as mongoose from  "mongoose";
import { getEnvironmentVariables } from "./environments/env";
import { Server } from "./server";


let server=new Server().app;
let port=5000;
server.listen(port,()=>{
     console.log('Server is Running');
})