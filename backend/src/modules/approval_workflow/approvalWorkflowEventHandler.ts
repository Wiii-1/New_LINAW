import { eventBus } from "../../shared/events/eventBus.js";
import { purchaseRequisitionSubmittedEvent,
         PurchaseRequisitionCancelledEvent
 } from "../../shared/events/purchaseRequisitionSubmissionEvent.js"
import { ApprovalWorkflowService } from "./approvalWorkflowService.js";

export function purchaseRequisitionEvent (
    approvalWorkflowService: ApprovalWorkflowService
) {
    eventBus.subscribe<purchaseRequisitionSubmittedEvent>(
        "purchase-requisition.submitted",
        async (event) => {
            await approvalWorkflowService.createApprovalRequest({
                    purchaseRequisitionId: event.purchaseRequisitionId,
                    tenantId: event.tenantId,
                    companyId: event.companyId,
                    userId: event.userId,
                    submitted_At: event.submitted_At
            })
        }
    )

    eventBus.subscribe<PurchaseRequisitionCancelledEvent>(
        "purchase-requisition.cancelled",
        async (event) => {
            await approvalWorkflowService.cancelApprovalRequest({
                purchaseRequisitionId: event.purchaseRequisitionId,
                tenantId: event.tenantId,
                companyId: event.companyId,
                userId: event.userId,
                cancalledAt: event.cancelledAt
            })
        }
    )
}
