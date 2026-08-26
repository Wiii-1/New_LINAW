import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { userManagementController } from "./userManagementController.js"
import { userManagementService } from "./userManagementService"
import { userManagementRepository} from "./userManagementRepository"


const router = Router();
const service = userManagementService( new userManagementRepository())
const controller = new userManagementController(service)

router.use(authenticate)

// User Profile Management
router.get("/profile", controller.profile)
router.patch("/profile", controller.updateProfile)


// Organization Onboarding
router.post("/companies/register", controller.companyRegistration)
router.get("/companies/:companyId", controller.companyId)