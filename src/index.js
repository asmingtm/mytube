import "dotenv/config";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import { PORT } from "./constants.js";

connectDB().then(() => {
    app.on("error", err => {
        console.log("Error on express:", err);
        throw err;
    })
    app.listen(PORT, () => {
        console.log("Server is listening on port:", PORT);
    });
}).catch(err => {
    console.error("Error recived while connecting database:", err);
    process.exit(1);
});