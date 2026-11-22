import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createApiRouter } from "./routes/api.js";
export function createApp(config) {
    const app = express();
    app.disable("x-powered-by");
    app.use(helmet(), cors({ origin: "*" }), express.json({ limit: "150kb" }));
    app.use("/api", createApiRouter(config));
    app.use((error, _req, res, _next) => {
        console.error(error.message);
        res
            .status(error.status ?? 500)
            .json({
            error: error.status
                ? error.message
                : "The request could not be completed.",
        });
    });
    return app;
}
