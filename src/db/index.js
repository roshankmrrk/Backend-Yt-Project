import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
DB_NAME
const ConnectDB = async()=>{
     try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`DB Connected || DB Host : ${connectionInstance.connection.host}`)
     }
     catch(error){
        console.log('Connection time Error',error);
        console.log("Current Connection URI:", process.env.MONGODB_URI,DB_NAME);
        process.exit(1)
     }
}

export default ConnectDB;