import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const userRouter = Router();

userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);

userRouter.route("/login").post(loginUser);

// Secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser); // VerifyJWT is a middleware here
userRouter.route("/token/refresh").post(refreshAccessToken); // JWT middleware is not required because authentication is technically handled by refreshAccessToken();