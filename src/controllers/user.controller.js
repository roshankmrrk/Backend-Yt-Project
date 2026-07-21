import { User } from "../modals/user.model.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req,res)=>{
   //Get user details from frontend
    const {email,password,username,fullname}= req.body
    console.log(email)

    //Validation: Not Empty
    if( [email,password,username,fullname].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"All feild are required")
    }
    //Check if user already exists : username,email
    const ExistedUser = User.findOne({
        $or : [{email},{username}]
    })

    if(ExistedUser){
        throw new ApiError(409,"Email or Username is already exists.")
    }

    //Check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError (400, "Avatar file is required")
    }

    //Uploade them to cloudinary,avatar
    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError (400, "Avatar file is required")
    }

    //Create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url ||"",
        email,
        password,
        username: username.toLowerCase()
    })
    //remove password and refresh token feild from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
    //check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {registerUser}