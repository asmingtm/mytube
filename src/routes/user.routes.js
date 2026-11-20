import { Router } from "express";
import { upload, verifyJWT } from "#middlewares";
import { loginUser, logoutUser, refreshUserAccessToken, registerUser } from "#controllers";

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

/* VerifyJWT is a middleware here */
userRouter.route("/logout").post(verifyJWT, logoutUser);

/* JWT middleware is not required because authentication is technically handled by refreshUserAccessToken(); */
userRouter.route("/token/refresh").post(refreshUserAccessToken);