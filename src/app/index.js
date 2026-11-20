import express from "express";

import { registerMiddlewares } from "./middlewares.app.js";
import { registerRoutes } from "./routes.app.js";

export const app = express();

registerMiddlewares(app);
registerRoutes(app);