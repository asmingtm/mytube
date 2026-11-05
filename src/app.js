import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { DEFAULT_LIMIT } from "./constants.js";

export const app = express();

// Middlewares

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: DEFAULT_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: DEFAULT_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes

import { userRouter } from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);