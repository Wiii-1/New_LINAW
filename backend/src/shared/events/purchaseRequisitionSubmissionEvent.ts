export type purchaseRequisitionSubmittedEvent = {
    purchaseRequisitionId: string;
    tenantId: string;
    companyId: string;
    userId: string;
<<<<<<< Updated upstream
    entityType: string;    
=======
    entityType: string
>>>>>>> Stashed changes
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