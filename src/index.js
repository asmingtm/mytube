// require('dotenv').config({ path: '.env' })
import "dotenv/config"
import connectDB from "./db/index.js";

connectDB();

/*
// FIRST APPROACH--
import express from "express";
const app = express();

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", err => {
            console.error(err);
            throw err;
        });
        app.listen(process.env.PORT, () => {
            console.log("Server running on port:", process.env.PORT);
        })
    }
    catch (err){
        console.error(err)
        throw err
    }
})();
*/