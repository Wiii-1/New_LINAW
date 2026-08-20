import { Router } from "express"
import { PurchaseRequisitionController } from "./purchaseRequisitionController.js"
import { purchaseRequisitionService } from "./purchaseRequisitionService.js"
import { purchaseRequisitionRepository } from "./purchaseRequisitionRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { EventBus } from "../../shared/events/eventBus.js"
import { checkRateLimit } from "../../shared/middleware/rateLimit/rate-limiter.js"
import { Authorize } from "../../shared/Auhorization/authorize.js"
import { systemPermissions, systemPermissionSeeds } from "../../shared/Auhorization/seeds/systemPermissions.js"
import { systemRolePermissions } from "../../shared/Auhorization/seeds/systemRolePermissions.js"

const router = Router();
const service = new purchaseRequisitionService(new purchaseRequisitionRepository(), new EventBus());
const controller = new PurchaseRequisitionController(service);

router.use(authenticate)

// Post
router.post("/create", Authorize(systemPermissions.purchaseRequisition.create), controller.createRequisition );
router.post("/:requisitionId/submit", Authorize(systemPermissions.purchaseRequisition.submit), controller.submitRequisition);
router.post("/:requisitionId/cancel", Authorize(systemPermissions.purchaseRequisition.cancel),  controller.cancelRequisition);
router.post("/:requisitionId/resubmit", Authorize(systemPermissions.purchaseRequisition.submit),controller.resubmitRequisition)

// Get

router.get("/", Authorize(systemPermissions.purchaseRequisition.read),checkRateLimit,  controller.requisition );
router.get("/:requisitonId", Authorize(systemPermissions.purchaseRequisition.read), checkRateLimit,controller.details)

// Patch
router.patch("/:requisitionId", Authorize(systemPermissions.purchaseRequisition.update), controller.update)



export default router;

/*
    Dev note @Wiii-1:
    Refer to Purchase_Requisition.md API design documentation for endpoint details.
    The default GET endpoint contains query parameter rules and validation requirements
    starting at line 125.
*/