import { Hono } from "hono"
import { EventBus } from "../../shared/events/eventBus.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { criticalRateLimit } from "../../shared/middleware/rateLimit/critical-rate-limit.js"
import { Authorize } from "../../shared/Auhorization/authorize.js"
import { ApprovalWorkflowController } from "./approvalWorkflowController.js"
import { ApprovalWorkflowService} from "./approvalWorkflowService.js"
import { ApprovalWorkflowRepository } from "./approvalWorkflowRepository.js"
import type { AppContext } from "../../shared/types/hono.js"

export function createApprovalWorkflow () {
    const router = new Hono<AppContext>()
    const service = new ApprovalWorkflowService(new ApprovalWorkflowRepository(), new EventBus())
    const controller = new ApprovalWorkflowController(service)

    router.use(authenticate)
    router.use(criticalRateLimit)


    // POST
    router.post("/createLevels", controller.createLevels)
    router.post("/workflows", controller.createWorkflowDefinition)
    router.post("/:approvalWorkflowId/approve", controller.approve)
    router.post("/:approvalWorkflowId/reject", controller.reject)
    router.post("/:approvalWorkflowId/cancel", controller.cancel)

    // GET
    router.get("/", controller.approvalWorkflow)
    router.get("/workflows", controller.workflowCodes)
    router.get("/:approvalWorkflowId", controller.approvalRequest)

    return router;    
}
