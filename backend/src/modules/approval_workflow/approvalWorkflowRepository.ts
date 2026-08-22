import { Decimal } from "@prisma/client/runtime/client"
import { prisma } from "../../config/database.js"

/*
    ApprovalRequest
    ────────────────────────────────────
    id                  = "approval-123"
    tenant_id           = "tenant-001"
    company_id          = "company-001"

    entity_type         = "purchase_requisition"
    entity_id           = "requisition-456"

    requester_user_id   = "user-789"

    current_level       = 1
    status              = "pending"

    submitted_at        = ...
    resolved_at         = null    
*/

export type ApprovalActionType =
    | "approved"
    | "rejected"
    | "cancelled";

export type ApprovalRequestStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

export interface ApprovalRequestData {
    tenant_id: string
    company_id: string
    entity_type: string
    entity_id: string
    requester_user_id: string
    current_level: number
    status: ApprovalRequestStatus
    submitted_at: Date | null
}

export interface ApprovalLevelData {
    tenant_id: string
    company_id: string | null
    workflow_code: string
    level_no: number 
    role_id: string
    min_amount: Decimal | null
    max_amount: Decimal | null
    is_required: boolean
}

export interface ApprovalActionData {
    tenant_id: string
    approval_request_id: string
    level_id: string
    acted_by_user_id: string
    action: ApprovalActionType
    remarks: string | null
    acted_at: Date

}

export interface UpdateRequestStatusData {
    status: string
    remarks: string
}

export interface ApprovalWorkflowQuery {
    tenant_id: string;
    company_id: string;
    status?: ApprovalRequestStatus;
}

export class ApprovalWorkflowRepository {
/*
    ApprovalWorkflowRepository
    ├── findMany()
    ├── findByRequestId()
    ├── updateRequestStatus()
    ├── createApprovalRequest()
    ├── getApprovalRequestById()
    ├── createLevelOfApproval()
    ├── getLevelOfApprovalById()
    ├── createApprovalAction()
    └── getApprovalActionById()        
*/

    async findApprovalWorkflowRequests (
        approvalWorkflowId: string
    ) {
        return prisma.approvalRequest.findMany({
            take: 20,
            where: {
                id: approvalWorkflowId
            },
            select: {
                id: true,
                tenant_id: true,
                company_id: true,
                entity_type: true,
                entity_id: true,
                requester_user_id: true,
                current_level: true,
                status: true,
                submitted_at: true,
                resolved_at: true,
                created_at: true
            }
        })
    }

    async findApprovalRequestByStatus (
        status: ApprovalRequestStatus
    ) {
        return prisma.approvalRequest.findMany({
            take: 15,
            where: {
                status,
            },
        })
    }

    async findRequestById (
        approvalWorkflowId: string
    ) {
        return prisma.approvalRequest.findUnique({
            where:{
                id: approvalWorkflowId
            }
        })
    }

    async updateRequestStatus (
        approvalWorkflowId: string,
        data: UpdateRequestStatusData
    ) {
        return prisma.approvalRequest.update({
            where: {
                id: approvalWorkflowId
            },
            data
        })
    }

    async createApprovalRequest (
        data: ApprovalRequestData
    ) {
        return prisma.approvalRequest.create({
            data: {
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                entity_type: data.entity_type,
                entity_id: data.entity_id,
                requester_user_id: data.requester_user_id,
                current_level: data.current_level,
                status: data.status,
                submitted_at: data.submitted_at
            }
        })
    }

    async getApprovalRequestById (
        approvalWorkflowId: string
    ) {
        return prisma.approvalRequest.findUnique({
            where: {
                id: approvalWorkflowId
            }
        })
    }

    async createLevelOfApproval (
        data: ApprovalLevelData
    ) {
        return prisma.approvalWorkflowLevel.create({
            data: {
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                workflow_code: data.workflow_code,
                level_no: data.level_no,
                role_id: data.role_id,
                min_amount: data.min_amount,
                max_amount: data.max_amount,
                is_required: data.is_required                 
            }
        })
    }

    async getLevelOfApprovalById (
        approvalWorkflowId: string
    ) {
        return prisma.approvalWorkflowLevel.findUnique({
            where: {
                id: approvalWorkflowId
            }
        })
    }

    async createApprovalAction(
        data: ApprovalActionData
    ) {
        return prisma.approvalAction.create({
            data: {
                tenant_id: data.tenant_id,
                approval_request_id: data.approval_request_id,
                level_id: data.level_id,
                acted_by_user_id: data.acted_by_user_id,
                action: data.action,
                remarks: data.remarks,
                acted_at: data.acted_at,
            },
        });
    }

    async getApprovalActionById (
        approvalWorkflowId: string
    ) {
        return prisma.approvalAction.findUnique({
            where: {
                id: approvalWorkflowId
            }
        })
    }

}