import { Router  } from "express";
import { authController } from "./authController.js";

const router = Router();
const controller = new authController();

router.get("/me", controller.getUserById);
router.post("/signup", controller.createUser);
router.post("/login", controller.loginUser);
router.post("/logout", controller.logoutUser);
router.post("/refresh", controller.refreshToken);
router.post("validate_token", controller.validate_token);

export default router;
 