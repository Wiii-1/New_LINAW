export type purchaseRequisitionSubmittedEvent = {
    purchaseRequisitionId: string;
    tenantId: string;
    companyId: string;
    userId: string;
    submitted_At: Date;
}

export type PurchaseRequisitionCancelledEvent = {
    purchaseRequisitionId: string;
    tenantId: string;
    companyId: string;
    userId: string;
    cancelledAt: Date;
};

export type PurchaseRequisitionResubmittedEvent = {
    purchaseRequisitionId: string;
    tenantId: string;
    companyId: string;
    userId: string;
    submitted_At: Date;
}