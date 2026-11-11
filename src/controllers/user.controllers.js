import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { uploadToCloudinary } from "../services/cloudinary.services.js";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    }
    catch(err){
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens:", err);
    }
}

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

export const loginUser = asyncHandler(async (req, res) => {
    // create a api route for login: /api/v1/user/login
    // get data sent by user from req.body
    // match username/email
    // find the user: if no user => err
    // if user: check password
    // if match: generate access token and refresh token using our functions and send it back to the user.
    // send cookie

    console.log("recived request:", req.body);

    const { username, email, password } = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or Email is required!")
    }

    console.log("username and email were provided:", username, email);

    const foundUser = await User.findOne({ $or: [{username}, {email}] }); // issue here
    if(!foundUser){
        throw new ApiError(404, "User not found!");
    }

    console.log("found user:", foundUser);

    const isPasswordCorrect = await foundUser.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid credentials provided");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(foundUser._id);

    const loggedInUser = await User.findById(foundUser._id).select("-password -refreshToken");

    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
    }, "User logged in sucessfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined }
    }, {
        new: true,
    });

    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged our sucessfully!"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
	const incommingRefreshToken = req.cookies?.refreshAccessToken || req.body.refreshToken;
	if(!incommingRefreshToken){
		throw new ApiError(401, "Unauthorized request (user doesnot have refresh token)")
	}

	try {
		const decodedToken = jwt.verify(incommingRefreshToken, REFRESH_TOKEN_SECRET);

		const foundUser = await User.findById(decodedToken._id);
		if(!foundUser){
			throw new ApiError(401, "Invalid refresh token!");
		}

		if(incommingRefreshToken !== foundUser.refreshToken){
			throw new ApiError(401, "Refresh token is expired or used");
		}

		const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(foundUser._id);

		return res.status(200)
		.cookie("accessToken", accessToken)
		.cookie("refreshToken", refreshToken)
		.json(
			new ApiResponse(201, { accessToken, refreshToken }, "Renewed refresh token and access token!")
		);
	}
	catch (err) {
		throw new ApiError(400, "Error when rewning token (invalid token)", err);
	}
});