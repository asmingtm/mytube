import "dotenv/config";

import { connectDB } from "#db";
import { app } from "#app";
import { PORT } from "#consts";

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