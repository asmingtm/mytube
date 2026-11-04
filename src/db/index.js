import mongoose from "mongoose";
import { FULL_MONGODB_URI } from "../constants.js";

export async function connectDB(){
    try {
        const instance = await mongoose.connect(FULL_MONGODB_URI);
        console.log("Database connected sucessfuly!");
        console.log("Connection Host:", instance.connection.host);
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}