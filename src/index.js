import dotenv from "dotenv";
import mongoose from "mongoose";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config();
ConnectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR:- ", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Port running at : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error during db connection", err);
  });



































  

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
