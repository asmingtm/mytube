import jwt from "jsonwebtoken";
import { User } from "#models";
import { REFRESH_TOKEN_SECRET } from "#consts";
import { uploadToCloudinary } from "#services";
import { asyncHandler, ApiError, ApiResponse } from "#utils";

// Basic user controls for their account.

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

// Generating and assigning tokens.

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

export const refreshUserAccessToken = asyncHandler(async (req, res) => {
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

// Retriving the user's data.

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched sucessfully"));
});

// Updating the user's account.

export const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                fullName,
                email,
            }
        },
        {
            new: true,
        }
    ).select("-password");

    return res.status(200).json(new ApiResponse(201, user, "Account details fetched sucessfully!"));
});

export const updateUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Old password did not match!");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(201, {}, "Password changed sucessfully"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar's file is missing..")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    if(!avatar || !avatar.url){
        throw new ApiError(500, "Error while updating the avatar");
    }
    
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url,
        }
    }).select("-password");

    res.status(200).json(new ApiResponse(201, { avatar: { url: avatar.url } }, "Avatar updated sucessfully"))
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
    
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image's file is missing!");
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    if(!coverImage || coverImage?.url){
        throw new ApiError(500, "Error occured while uploading file to cloudinary");
    }

    User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url,
        }
    }).select("-password");

    res.status(200).json(new ApiResponse(201, { coverImage: { url: coverImage } }, "Cover image updated sucessfully"));
});