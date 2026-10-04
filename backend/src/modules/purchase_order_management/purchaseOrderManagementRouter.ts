import { Hono } from "hono";
import type { AppContext } from "../../shared/types/hono";
import { authenticate } from "../../shared/middleware/authenticate";
import { PurchaseOrderManagementController } from "./purchaseOrderManagementController";
import { PurchaseOrderManagementService } from "./purchaseOrderManagementService";
import { PurchaseOrderManagementRepository } from "./purchaseOrderManagementRepository";
import { EventBus } from "../../shared/events/eventBus";

export function createPurchaseOrderManagement() {
    const router = new Hono<AppContext>();

    const service = new PurchaseOrderManagementService(
        new PurchaseOrderManagementRepository(),
        new EventBus()
    );

    const controller = new PurchaseOrderManagementController(service);

    router.use(authenticate);

    // POST

    router.post("/", controller.createPurchaseOrder);
    router.post("/rfqs", controller.createRFQS);
    router.post("/rfqs/:rfqId/publish", controller.publishRfqs);
    router.post(
        "/rfqs/:rfqId/quotations/:quotationId/select",
        controller.selectSupplier,
    );

    // GET

    router.get("/", controller.getList);
    router.get("/rfqs", controller.getRfqs);
    router.get("/rfqs/:rfqId/quotations", controller.getQuotationList);
    router.get(
        "/rfqs/:rfqId/quotations/:quotationId",
        controller.getQuotation,
    );
    router.get("/:poId", controller.getPO);

    // PATCH

    router.patch("/rfqs/:rfqId", controller.updateRfq);
    router.patch("/:poId", controller.updatePo);

    // DELETE

    router.delete("/rfqs/:rfqId", controller.deleteRfq);
    router.delete("/:poId", controller.deletePurchaseOrder);

    return router;
}