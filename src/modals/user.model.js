import mongoose, {Schema} from 'mongoose'
import bcrypt from "bcrypt"
import { use } from 'react';
import { JsonWebTokenError } from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        Index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        Index:true,
    },    
    avatar:{
        type:String, //Cloudinary string of uploaded image
        required: true,
    },    
    coverImage:{
        type:String, //Cloudinary string of uploaded image
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:true,
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password"))return next();
     
     this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAcessToken = function(){
    return jwt.sign(

        //Payload || Data
        {
            _id: this.id,
            password: this.password,
            username:this.username,
            fullname:this.fullname
        },

        // Secret Key
        process.env.ACCESS_TOKEN_SECRET,

        //Token Expiry
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this.id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
}


export const User = mongoose.model('User',userSchema)