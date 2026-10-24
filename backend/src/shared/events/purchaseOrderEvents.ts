export type PurchaseOrderCompletedEvent = {
  purchaseOrderId: string;
  tenantId: string;
  actorId: string;
  entityId: string;
  eventType: "COMPLETED";
};
