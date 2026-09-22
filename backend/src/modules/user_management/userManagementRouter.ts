import type { AppContext } from "../../shared/types/hono.js";
import { Hono } from "hono";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { userManagementController } from "./userManagementController.js"
<<<<<<< Updated upstream
import { UserManagementService } from "./userManagementService.js"
import { UserManagementRepository} from "./userManagementRepository.js"
import { EventBus } from "../../shared/events/eventBus.js";


const router = Router();
const service = new UserManagementService( new UserManagementRepository(), new EventBus())
const controller = new userManagementController(service)
=======
import { UserManagementService } from "./userManagementService.js";

export function createUserManagementRouter () {
    const router = new Hono<AppContext>();
    const service = new UserManagementService()
    const controller = new userManagementController(service)

    router.use(authenticate)

    // User Profile Management
    router.get("/profile", controller.profile)
    router.patch("/profile", controller.updateProfile)


    // Organization Onboarding
    router.post("/companies/register", controller.companyRegistration)
    router.get("/companies/:companyId", controller.companyId)    
>>>>>>> Stashed changes

    return router
}


