import { userRouter } from "#routes";

export function registerRoutes(app) {
    app.use("/api/v1/users", userRouter);
}