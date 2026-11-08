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

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    console.log("TEST | existingUser:", existingUser);

    if(existingUser){
        throw new ApiError(400, "User already exists!");
    }

    console.log("TEST | req.files:", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : null;

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

    const createdUser = await User.findById(newUser?._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered sucessfully"));
});