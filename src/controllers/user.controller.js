import {User} from "../modals/user.model.js";
import {ApiError} from "../utils/apierror.js";
import {ApiResponse} from "../utils/apiresponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {UploadOnCloudinary} from "../utils/cloudinary.js";

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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export {registerUser};
