import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { DATA_LIMIT } from "./constants";

export const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}));

app.use(express.json({
    limit: DATA_LIMIT
}));

app.use(express.urlencoded({
    limit: DATA_LIMIT,
    extended: false, 
}));

app.use(express.static("public"));

app.use(cookieParser());