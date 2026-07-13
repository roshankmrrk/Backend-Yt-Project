import dotenv from 'dotenv'
import mongoose from "mongoose"
import ConnectDB from "./db/index.js"

dotenv.config();
ConnectDB();



















/*
import express from 'express'
const App = express();
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI} /${DB_NAME}`)
        App.on('error',(error)=>{
            console.log("ERROR:- ",error);
            throw error
        })
        App.listen(process.env.PORT,()=>{
            console.log(`Port is running at : ${process.env.PORT}`)

        })
    }
    catch(error){
        console.log('ERROR While connecting Database : ',error)
    }
})(
   
)*/