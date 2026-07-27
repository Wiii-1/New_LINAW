import { Router  } from "express";
import { authController } from "./authController.js";z

const router = Router();
const controller = new authController();

router.get("/me", controller.getUserById);
router.post("/signup", controller.createUser);
router.post("/login", controller.loginUser);
router.post("/logout", controller.logoutUser);
router.post("/refresh", controller.refreshSession);
router.post("validate_token", controller.validate_token);

export default router;
 