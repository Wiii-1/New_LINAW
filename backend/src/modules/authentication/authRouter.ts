import { Router  } from "express";
import { AuthController } from "./authController.js";
import { AuthService } from "./authServices.js";
import { AuthRepository } from "./authRepository.js";
import { authenticate } from "../../shared/middleware/authenticate.js";

const router = Router();
const service = new AuthService(new AuthRepository());
const controller = new AuthController(service);

router.post("/signup", controller.createUser);
router.post("/login", controller.loginUser);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.get("/:id", authenticate,controller.getUserById);
router.post("/logout", authenticate, controller.logoutUser);
router.post("/refresh", authenticate,controller.refreshToken);
router.post("/validate_token", authenticate,controller.validate_token);

export default router;
 