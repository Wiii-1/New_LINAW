import { Router } from "express"
import { PurchaseRequisitionController } from "./purchaseRequisitionController.js"
import { purchaseRequisitionService } from "./purchaseRequisitionService"
import { purchaseRequisitionRepository } from "./purchaseRequisitionRepository"
import { authenticate } from "../../shared/middleware/authenticate.js"

const router = Router();
const service = new purchaseRequisitionService(new purchaseRequisitionRepository());
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
router.patch("/:requisitionId/status", controller.updateStatus)


export default router;

/*
    Dev note @Wiii-1:
    Refer to Purchase_Requisition.md API design documentation for endpoint details.
    The default GET endpoint contains query parameter rules and validation requirements
    starting at line 125.
*/