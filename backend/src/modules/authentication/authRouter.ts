import { Router  } from "express";
import { AuthController } from "./authController.js";
import { AuthService } from "./authServices.js";
import { AuthRepository } from "./authRepository.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRateLimit } from "../../shared/middleware/rateLimit/rate-limiter.js";

const router = Router();
const service = new AuthService(new AuthRepository());
const controller = new AuthController(service);

router.post("/signup", checkRateLimit,controller.createUser);
router.post("/login", checkRateLimit, controller.loginUser);
router.post("/forgot-password", checkRateLimit, controller.forgotPassword);
router.post("/reset-password", checkRateLimit,controller.resetPassword);
router.get("/:id", checkRateLimit, authenticate,controller.getUserById);
router.post("/logout", authenticate, controller.logoutUser);
router.post("/refresh", authenticate,controller.refreshToken);
router.post("/validate_token", authenticate,controller.validate_token);

export default router;
 