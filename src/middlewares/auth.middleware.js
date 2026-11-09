import { ApiError } from "../utils/ApiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants.js"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!accessToken){
            throw new ApiError(401, "Unauthorized request!");
        }
    
        const decodedAccessToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    
        const foundUser = await User.findById(decodedAccessToken?._id).select("-password -refreshToken");
        if(!foundUser){
            throw new ApiError(401, "Could not find user from decoded access token:", decodedAccessToken);
        }
    
        req.user = foundUser;
        next();
    } catch (err) {
        throw new ApiError(401, "Invalid Access Token:", err);
    }
});