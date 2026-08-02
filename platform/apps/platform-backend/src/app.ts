import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { ApiSuccessResponse, asyncHandler, errorHandler } from "@platform/http";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { authRouter } from "./app/auth/auth.routes";

export function createApp(): Express {
    const app = express();

    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan("dev"));

    app.get(
        "/health",
        asyncHandler(async (_req, res) => {
            new ApiSuccessResponse("OK", { uptime: process.uptime() }).send(res);
        })
    );

    app.use("/api/v1/auth", authRouter);
    // more feature routers get registered here as each module is built, e.g.:
    // app.use("/api/v1/organizations", organizationsRouter);

    app.use(notFoundMiddleware);
    app.use(errorHandler);

    return app;
}
