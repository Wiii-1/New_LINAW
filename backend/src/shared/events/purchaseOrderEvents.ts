export type purchaseOrderCompletedEvent = {
    purchaseOrderId: string
    tenantId: string
    actorId: string
    eventType: "COMPLETED"
}