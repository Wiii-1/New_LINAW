import { Hono } from "hono"
import { EventBus } from "../../shared/events/eventBus.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { criticalRateLimit } from "../../shared/middleware/rateLimit/critical-rate-limit.js"
import { Authorize } from "../../shared/Authorization/authorize.js"
import { ApprovalWorkflowController } from "./approvalWorkflowController.js"
import { ApprovalWorkflowService } from "./approvalWorkflowService.js"
import { ApprovalWorkflowRepository } from "./approvalWorkflowRepository.js"
import type { AppContext } from "../../shared/types/hono.js"

export function createApprovalWorkflow() {
    const router = new Hono<AppContext>()

    const service = new ApprovalWorkflowService(
        new ApprovalWorkflowRepository(),
        new EventBus(),
    )

    const controller = new ApprovalWorkflowController(service)

    router.use(authenticate)
    router.use(criticalRateLimit)

    // POST
    router.post(
        "/createLevels",
        Authorize("approval_workflow:create_level"),
        controller.createLevels,
    )

    router.post(
        "/workflows",
        Authorize("approval_workflow:create_workflow"),
        controller.createWorkflowDefinition,
    )

    router.post(
        "/:approvalWorkflowId/approve",
        Authorize("approval_workflow:approve"),
        controller.approve,
    )

    router.post(
        "/:approvalWorkflowId/reject",
        Authorize("approval_workflow:reject"),
        controller.reject,
    )

    router.post(
        "/:approvalWorkflowId/cancel",
        Authorize("approval_workflow:cancel"),
        controller.cancel,
    )

    // GET
    router.get(
        "/",
        Authorize("approval_workflow:read"),
        controller.approvalWorkflow,
    )

    router.get(
        "/workflows",
        Authorize("approval_workflow:read"),
        controller.workflowCodes,
    )

    router.get(
        "/:approvalWorkflowId",
        Authorize("approval_workflow:read"),
        controller.approvalRequest,
    )

    return router
}