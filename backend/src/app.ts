import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { errorHandler } from "./shared/middleware/errorHandler.js";
import type { AppContext } from "./shared/types/hono.js";

import { initializeJWT } from "./modules/authentication/authJWT.js";
import { createAuthRouter } from "./modules/authentication/authRouter.js";
import type { AppEnv } from "./config/env.js";

export function createApp(env: AppEnv) {
    const app = new Hono<AppContext>();

    app.use(cors());
    app.use(secureHeaders());
    app.use(logger());

    app.onError(errorHandler);

    app.get("/health", (c) => {
        return c.json({
            success: true,
            message: "LINAW API is running",
        });
    });

    initializeJWT(env);

    app.route("/auth", createAuthRouter(env));

    return app;
}