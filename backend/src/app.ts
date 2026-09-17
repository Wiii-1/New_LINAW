import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./shared/middleware/errorHandler.js";

import type { AppContext } from "./shared/types/hono.js";
import type { AppEnv } from "./config/env.js";

import { initializeJWT } from "./modules/authentication/authJWT.js";
import { createAuthRouter } from "./modules/authentication/authRouter.js";
import { createAuditRouter } from "./modules/audit_trail/auditTrailRouter.js";
import { AuditTrailRepository } from "./modules/audit_trail/auditTrailRepository.js";
import { AuditTrailService } from "./modules/audit_trail/auditTrailService.js";
import { BlockchainAdapter } from "./shared/blockchain/blockchainAdapter.js";

export function createApp(env: AppEnv) {
    const app = new Hono<AppContext>();

    app.use(cors());
    app.use(secureHeaders());
    app.use(logger());

    app.onError(errorHandler);

    const blockchainAdapter = new BlockchainAdapter(env);    
    const repository = new AuditTrailRepository()
    const service = new AuditTrailService(repository, blockchainAdapter)

    app.get("/health", (c) => {
        return c.json({
            success: true,
            message: "LINAW API is running",
        });
    });

    initializeJWT(env);

    app.route("/auth", createAuthRouter(env));
    app.route("/auditTrail", createAuditRouter(service))


    return app;
}