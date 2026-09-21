import { Hono } from "hono"
import { AuthController } from "./authController.js";
import { AuthService } from "./authServices.js";
import { AuthRepository } from "./authRepository.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { criticalRateLimit } from "../../shared/middleware/rateLimit/critical-rate-limit.js";
import type { AppContext } from "../../shared/types/hono.js";
import type { AppEnv } from "../../config/env.js";

export function createAuthRouter(env: AppEnv){
    const router = new Hono<AppContext>();
    const service = new AuthService(new AuthRepository(), env);
    const controller = new AuthController(service);

    router.post("/signup", criticalRateLimit, controller.createUser);
    router.post("/login",criticalRateLimit, controller.loginUser);
    router.post("/forgot-password",criticalRateLimit, controller.forgotPassword);
    router.post("/reset-password",criticalRateLimit, authenticate,controller.resetPassword);
    router.get("/:id", authenticate,controller.getUserById);
    router.post("/logout", authenticate,   controller.logoutUser);
    router.post("/refresh",  controller.refreshToken);
    router.post("/validate_token",  controller.validate_token);

    return router;
}
 