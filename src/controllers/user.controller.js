import jwt from "jsonwebtoken";
import {User} from "../modals/user.model.js";
import {ApiError} from "../utils/apierror.js";
import {ApiResponse} from "../utils/apiresponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {UploadOnCloudinary} from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new ApiError(500, "JWT secrets are not configured.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "User id is not exist.");
    }

    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("generateAccessAndRefreshToken error:", error);
    throw new ApiError(
      402,
      error.message || "Something wrong during acess and refresh token sending."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //Get user details from frontend
  const {email, password, username, fullName} = req.body;
  console.log(req.body);

  //Validation: Not Empty
  if (
    [email, password, username, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All feild are required");
  }
  //Check if user already exists : username,email
  const ExistedUser = await User.findOne({
    $or: [{email}, {username}],
  });

  if (ExistedUser) {
    throw new ApiError(409, "Email or Username is already exists.");
  }

  //Check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar local path file is required");
  }

  //Uploade them to cloudinary,avatar
  console.log(avatarLocalPath, coverImageLocalPath);
  const avatar = await UploadOnCloudinary(avatarLocalPath);
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await UploadOnCloudinary(coverImageLocalPath);
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //remove password and refresh token feild from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(createdUser);

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //Fetch data from req.body
  const {email, username, password} = req.body;

  //username or email vailidate
  if (!(email || password)) {
    throw new ApiError(401, "Username or email required.");
  }

  //Check user is exiests or not
  const user = await User.findOne({
    $or: [{username}, {email}],
  });

  if (!user) {
    throw new ApiError(404, "User is not exists.");
  }

  //password check vaildate
  const isVailidatePassword = await user.isPasswordCorrect(password);
  if (!isVailidatePassword) {
    throw new ApiError(401, "Invaild Credential");
  }

  //acess and refresh token generate
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  //send cookie

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: accessToken,
          refreshToken,
          loggedInUser,
        },
        "User login successfully."
      )
    );
  //send res-> sucess login
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", "", { ...options, maxAge: 0 })
    .cookie("refreshToken", "", { ...options, maxAge: 0 })
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refershAccessToken = asyncHandler(async (req,res)=>{
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized Request")
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?.id)
  
    if(!user){
       throw new ApiError(401,"Invaild Refersh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError (401, "Refersh Token is expired or used")
    }
    const options= {httpOnly:true , secure:true }
  
    const {accessToken, newRefershToken} =  await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("Access Token", accessToken, options)
    .cookie("refershToken", newRefershToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken,  refreshToken: newRefershToken},
        "Access Token Refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invaild refersh token")
  }
})
export {registerUser, loginUser, logoutUser, refershAccessToken};
