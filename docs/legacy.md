[home](../README.md)/[legacy](./legacy.md)
# Legacy codes & snippets
There are codes that are unused or optional version of the best approach.

### Connecting DB in one file instead of using `./src/db/` file.
```js
require("dotenv").config({ path: "./env" });

import mongoose from "mongoose";
import express from "express";
import { FULL_MONGODB_URI, PORT } from "./constants";

const app = express();

(async () => {
    try {
        const db = await mongoose.connect(FULL_MONGODB_URI);

        app.on("error", err => {
            console.error("Error on express:", err);
            throw err;
        });
        app.listen(PORT, () => {
            console.log("Server is running on port:", PORT);
        });
    } catch (err) {
        console.error("Error while connecting database:", err);
        throw err;
    }
})();
```
### Async function utility with `Promises` instead of `try` & `catch` blocks.
```js
export const asyncHandler = (reqHandler) => (req, res, next) => (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch(next)
}
```