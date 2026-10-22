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