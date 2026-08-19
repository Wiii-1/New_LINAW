import { prisma } from "../../config/database.js"
import { Prisma, PurchaseRequisitionStatus, PurchaseRequisitionPriority } from "../../generated/prisma/client.js"


export interface purchaseRequisitionData {
    id: string;
    root_id: string;
    tenant_id: string;
    company_id: string;
    pr_number: string;
    generation: number;
    requested_by_user_id: string;
    purpose: string;
    justification: string;
    status: PurchaseRequisitionStatus;
    priority: PurchaseRequisitionPriority;
    currency_code: string;
    total_amount: Prisma.Decimal;
    needed_by_date: Date | null;
    created_at: Date;
}

export interface PurchaseRequisitionItemCreateData {
    tenant_id: string;
    purchase_requisition_id: string;
    line_no: number;
    item_type: string;
    description: string;
    specification: string;
    quantity: number;
    unit_of_measure: string;
    estimated_unit_cost: number;
    estimated_total_cost: number;
    category_id: string | null ;
    needed_by_date: string | null;
    status: PurchaseRequisitionStatus;
}

export interface purchaseRequisitionStatusLogData {
    tenant_id: string;
    purchase_requisition_id: string;
    from_status: string | null;
    to_status: string;
    action: string;
    acted_by_user_id: string;
    remarks: string | null;
    acted_at: Date;
    metadata_json: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
}

export interface PurchaseRequisitionUpdateData {
    requested_by_user_id: string;
    remarks: string;
    purpose?: string | undefined;
    justification?: string | undefined;
    priority?: PurchaseRequisitionPriority | undefined;
    needed_by_date?: string | undefined;
}

export class purchaseRequisitionRepository {
    
    // Query

    async findByRequisitionId (
        requisitionId: string
    ) {
        return prisma.purchaseRequisition.findUnique({
            where: {
                id: requisitionId
            }
        })
    }

    async findRequisitionsForList(
        requisitionId: string
    ) {
        return prisma.purchaseRequisition.findMany({
            where: {
                id: requisitionId
            },
            select: {
                id: true,
                pr_number: true,
                company_id: true,
                requested_by_user_id: true,
                purpose: true,
                priority: true,
                currency_code: true,
                total_amount: true,
                needed_by_date: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }

    async findDetailsById(
        requisitionId: string
    ) {
        return prisma.purchaseRequisition.findUnique({
            where: {
                id: requisitionId
            },
            select: {
                id: true,
                pr_number: true,
                purpose: true,
                justification: true,
                status: true,
                priority: true,
                currency_code: true,
                total_amount: true,
                needed_by_date: true,
                submitted_at: true,
                approved_at: true,
                rejected_at: true,
                created_at: true,
                updated_at: true,

                items: {
                    orderBy: {
                        line_no: "asc"
                    }
                },

                requested_by_user: true,
                company: true,

                status_logs: {
                    orderBy: {
                        acted_at: "desc"
                    }
                }
            }
        });
    }

    async findByUserId (
        userId: string
    ) {
        return prisma.user.findUnique({
            where: { 
                id: userId
            }
        })
    }

    async findActiveByUserId(userId: string) {
        return prisma.companyMembership.findFirst({
            where: {
                user_id: userId,
                employment_status: "ACTIVE"
            },
            select: {
                company_id: true
            }
        });
    }

    async findLatestRevision (
        root_id:string
    ){
        return prisma.purchaseRequisition.findFirst({
            where: {
                root_id: root_id
            },
            orderBy: {
                generation: "desc"
            }
        })
    }

    // Mutations 

    async createRequisition (
        data: purchaseRequisitionData
    ) {
        return prisma.purchaseRequisition.create({
            data
        })
    }

    async createItems (
        dataItems: PurchaseRequisitionItemCreateData[]
    ) {
        return prisma.purchaseRequisitionItem.createMany({
            data: dataItems
        })
    }

    async resubmit (
        data: purchaseRequisitionData
    ) {

        return prisma.purchaseRequisition.create({
            data
        })
    }

    async update(
        requisitionId: string,
        updateData: PurchaseRequisitionUpdateData
    ) {
        const data: Prisma.PurchaseRequisitionUpdateInput = {};

        if (updateData.purpose !== undefined) {
            data.purpose = updateData.purpose;
        }

        if (updateData.justification !== undefined) {
            data.justification = updateData.justification;
        }

        if (updateData.priority !== undefined) {
            data.priority = updateData.priority;
        }

        if (updateData.needed_by_date !== undefined) {
            data.needed_by_date = new Date(updateData.needed_by_date);
        }

        return prisma.purchaseRequisition.update({
            where: {
                id: requisitionId
            },
            data
        });
    }

    async updateStatus(
        requisitionId: string,
        data: {
            status: PurchaseRequisitionStatus;
            submitted_at?: Date;
            cancelled_at?: Date;
        }
    ) {
        return prisma.purchaseRequisition.update({
            where: {
                id: requisitionId
            },
            data
        });
    }

    // audit
    async createStatusLog(
        data: purchaseRequisitionStatusLogData
    ) {
        return prisma.purchaseRequisitionStatusLog.create({
            data
        });
    }
}
