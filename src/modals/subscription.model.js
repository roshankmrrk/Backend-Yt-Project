import mongoose, { Schema, Types, model } from "mongoose";
import { User } from "./user.model";

const subscriptionSchema = new Schema({
    subscriber:{
        Types: Schema.Types.ObjectId ,//Who is subscribing?
        ref:"User"
    },
    channle:{
        Types: Schema.Types.ObjectId ,//Who is subscribing?
        ref:"User"
    }

},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)