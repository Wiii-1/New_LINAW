import { Router } from "express"
import { EventBus } from "../../shared/events/eventBus.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { criticalRateLimit } from "../../shared/middleware/rateLimit/critical-rate-limit.js"
import { Authorize } from "../../shared/Auhorization/authorize.js"
import { ApprovalWorkflowController } from "./approvalWorkflowController.js"
import { ApprovalWorkflowService} from "./approvalWorkflowService.js"
import { ApprovalWorkflowRepository } from "./approvalWorkflowRepository.js"

const router = Router()
const service = new ApprovalWorkflowService(new ApprovalWorkflowRepository(), new EventBus())
const controller = new ApprovalWorkflowController(service)

router.use(authenticate)
router.use(criticalRateLimit)


// POST
router.post("/:requesitionId/approve", controller.approve)
router.post("/:requisitionId/reject", controller.reject)
router.post("/:requisitionId/cancel", controller.cancel)



// GET
router.get("/", controller.approvalWorkflow)
router.get("/:requisitionId", controller.approvalRequest)

export default router;
