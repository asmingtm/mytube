/* require('dotenv').config({ path: '.env' }) */
import "dotenv/config"
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { PORT } from "./constants.js";

connectDB()
.then(() => {
    const server = app.listen(PORT || 8000, () => {
        console.log("Server running on PORT:", PORT);
    });
    server.on("error", err => console.error);
})
.catch(err => {
    console.error("ERROR after connecting: \n", err);
});

/*
// FIRST APPROACH--
import express from "express";
const app = express();

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        const server = app.listen(PORT, () => {
            console.log("Server running on port:", PORT);
        });
        server.on("error", err => {
            console.error(err);
            throw err;
        });
    }
    catch (err){
        console.error(err)
        throw err
    }
})();
*/