import mongoose from "mongoose";
import { DB_URI } from "../constants.js";

async function connectDB(){
    try {
        const connectionInstance = await mongoose.connect(DB_URI);
        console.log("\n MongoDB connected \n DB Host:", connectionInstance.connection.host);
    }
    catch (err) {
        console.error("<Connection ERROR>: \n", err);
        process.exit(1); 
    }
}

export default connectDB;