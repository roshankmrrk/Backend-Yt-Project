import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloudname:process.env.CLOUDINARY_CLOUD_NAME,
    apikey : process.env.CLOUDINARY_API_KEY,
    apisecret : process.env.CLOUDINARY_API_SECRET,
})

const UploadOnCloudinary = async(localFilePath)=>{
    try{
        if(localFilePath) return null
        //upload the file on cloudinary
        const resonse = await cloudinary.uploader.upload(localFilePath,{
            resourse_type:"auto"
        })
        //File has been uploaded successfully
        console.log("File uploaded sucessfully",resonse.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {UploadOnCloudinary}