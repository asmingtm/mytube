import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN, DEFAULT_LIMIT } from "#consts";

export function registerMiddlewares(app) {
    app.use(cors({
        origin: CORS_ORIGIN,
        credentials: true
    }));
    app.use(express.json({ limit: DEFAULT_LIMIT }));
    app.use(express.urlencoded({ extended: true, limit: DEFAULT_LIMIT }));
    app.use(express.static("public"));
    app.use(cookieParser());
}