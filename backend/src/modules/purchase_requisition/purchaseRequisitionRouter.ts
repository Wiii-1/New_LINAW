import { Router } from "express"
import { PurchaseRequisitionController } from "./purchaseRequisitionController.js"
import { purchaseRequisitionService } from "./purchaseRequisitionService.js"
import { purchaseRequisitionRepository } from "./purchaseRequisitionRepository.js"
import { authenticate } from "../../shared/middleware/authenticate.js"
import { EventBus } from "../../shared/events/eventBus.js"

const router = Router();
const service = new purchaseRequisitionService(new purchaseRequisitionRepository(), new EventBus());
const controller = new PurchaseRequisitionController(service);

router.use(authenticate)

// Post
router.post("/create",  controller.createRequisition );
router.post("/:requisitionId/submit",  controller.submitRequisition);
router.post("/:requisitionId/cancel",  controller.cancelRequisition);
router.post("/:requisitionId/resubmit", controller.resubmitRequisition)

// Get

router.get("/", controller.requisition );
router.get("/:requisitonId", controller.details)

// Patch
router.patch("/:requisitionId", controller.update)



export default router;

/*
    Dev note @Wiii-1:
    Refer to Purchase_Requisition.md API design documentation for endpoint details.
    The default GET endpoint contains query parameter rules and validation requirements
    starting at line 125.
*/