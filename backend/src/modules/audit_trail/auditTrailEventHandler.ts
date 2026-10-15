import { eventBus } from "../../shared/events/eventBus.js";
import type { PurchaseOrderCompletedEvent } from "../../shared/events/purchaseOrderEvents.js";
import { AuditTrailService } from "./auditTrailService.js";

let auditTrailEventsRegistered = false;

export function registerAuditTrailEvents (
    auditTrailService: AuditTrailService
) {
    if (auditTrailEventsRegistered) {
        return;
    }

    auditTrailEventsRegistered = true;
    
    eventBus.subscribe<PurchaseOrderCompletedEvent>(
        "purchase-order.completed",
        async (event) => {
            await auditTrailService.createAuditTrail({
                purchaseOrderId: event.purchaseOrderId,
                tenantId: event.tenantId,
                actorId: event.actorId,
                entityId: event.entityId,
                eventType: event.eventType
            })
        }
    )
}