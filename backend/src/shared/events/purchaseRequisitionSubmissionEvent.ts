export type purchaseRequisitionSubmittedEvent = {
    purchaseRequisitionId: string;
    tenantId: string;
    companyId: string;
    userId: string;
    entityType: string;    
    submitted_At: Date;
}

export type PurchaseRequisitionCancelledEvent = {
    purchaseRequisitionId: string;
    tenantId: string;
    companyId: string;
    userId: string;
    entityType: string;
    cancelledAt: Date;
};