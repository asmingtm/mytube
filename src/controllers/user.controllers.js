import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { uploadToCloudinary } from "../services/cloudinary.services.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    if([username, email, fullName, password].some(field => field?.trim() === "")){
        throw new ApiError(400, "All fields are required!");
    }

    const existingUser = User.findOne({ $or: [{ usermame }, { email }] });

    console.log("TEST | existingUser:", existingUser);

    if(existingUser){
        throw new ApiError(400, "User already exists!");
    }

    console.log("TEST | req.file:", req.file);

    const avatarLocalPath = req.file?.avatar[0]?.path;
    const coverImageLocalPath = req.file?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError("Failed to push avatar to cloudinary!");
    }

    const newUser = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,
    });

    const createdUser = User.findById(newUser?._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered sucessfully"));
});