import { Router  } from "express";
import { AuthController } from "./authController.js";
import { AuthService } from "./authServices.js";
import { AuthRepository } from "./authRepository.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { criticalRateLimit } from "../../shared/middleware/rateLimit/critical-rate-limit.js";

const router = Router();
const service = new AuthService(new AuthRepository());
const controller = new AuthController(service);

router.post("/signup", criticalRateLimit, controller.createUser);
router.post("/login",criticalRateLimit, controller.loginUser);
router.post("/forgot-password",criticalRateLimit, controller.forgotPassword);
router.post("/reset-password",criticalRateLimit, authenticate,controller.resetPassword);
router.get("/:id", authenticate,controller.getUserById);
router.post("/logout", authenticate,   controller.logoutUser);
router.post("/refresh",  controller.refreshToken);
router.post("/validate_token",  controller.validate_token);

export default router;
 