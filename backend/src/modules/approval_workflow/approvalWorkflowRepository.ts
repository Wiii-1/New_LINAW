import { Decimal } from "decimal.js";
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

const SYSTEM_WORKFLOW_DEFINITION = [
    {
        workflow_code: "purchase_requisition",
        entity_type: "purchase_requisition",
        name: "Purchase Requisition",
        description: "Approval workflow for purchase requisitions",
    },{
        workflow_code: "contract",
        entity_type: "contract",
        name: "Contract",
        description: "Approval workflow for contracts",
    },{
        workflow_code: "expense",
        entity_type: "expense",
        name: "Expense",
        description: "Approval workflow for expense requests"
    }
] as const

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
    workflow_id: string
    level_no: number 
    role_id: string
    min_amount: Decimal | null
    max_amount: Decimal | null
    is_required: boolean
}

export interface ApprovalActionData {
    level_id: string
    tenant_id: string
    approval_request_id: string
    acted_by_user_id: string
    action: ApprovalActionType
    remarks: string | null
    acted_at: Date
}

export interface UpdateRequestStatusData {
    approval_Workflow_Id: string
    tenant_id: string
    status: string
    remarks?: string
}

export interface ApprovalWorkflowQuery {
    tenant_id: string;
    company_id: string;
    status?: ApprovalRequestStatus;
}

export interface ApprovalWorkflowDefinitionData {
    tenant_id: string | null
    company_id: string | null
    workflow_code: string
    name: string
    description: string | null
    entity_type: string
    is_system: boolean
    is_active: boolean
}

export interface GetData {
    tenant_id: string,
    compnay_id: string
}

export interface ApprovalRequest {
    approval_workflow_id: string
    tenant_id: string
}

export interface roleCheck {
    user_id: string
    tenant_id: string
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
        data: GetData
    ) {
        return prisma.approvalRequest.findMany({
            take: 20,
            where: {
                tenant_id: data.tenant_id,
                company_id: data.compnay_id
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

    async findActiveByUserId(userId: string) {
        return prisma.companyMembership.findFirst({
            where: {
                user_id: userId,
                employment_status: "ACTIVE"
            },
            select: {
                company_id: true,
                company: {
                    select: {
                        tenant_id: true
                    }
                }
            }
        });
    }    

    async findUserRole (
        data: roleCheck
    ) {
        return prisma.userRole.findFirst({
            where: {
                user_id: data.user_id,
                tenant_id: data.tenant_id
            },
            select: {
                role_id: true
            }
        })
    }

    async findRoleByCodeAndTenant(
        roleCode: string,
        tenantId: string,
    ) {
        return prisma.role.findFirst({
            where: {
                role_code: roleCode,
                tenant_id: tenantId,
            },
        });
    }

    async findApprovalWorkflowDefinition(
        workflowCode: string,
        tenantId: string,
    ) {
        return prisma.approvalWorkflowDefinition.findFirst({
            where: {
                workflow_code: workflowCode,
                OR: [
                    {
                        tenant_id: tenantId,
                        is_system: false,
                    },
                    {
                        tenant_id: null,
                        is_system: true,
                    },
                ],
                is_active: true,
            },
        });
    }


    async findLevelByWorkflowAndNumber(
        workflowId: string,
        levelNo: number,
    ) {
        return prisma.approvalWorkflowLevel.findFirst({
            where: {
                workflow_id: workflowId,
                level_no: levelNo,
            },
        });
    }    

    async findOverlappingLevel(
        workflowId: string,
        tenantId: string,
        minAmount: number,
        maxAmount: number,
    ) {
        return prisma.approvalWorkflowLevel.findFirst({
            where: {
                workflow_id: workflowId,
                workflow: {
                    tenant_id: tenantId,
                },
                min_amount: {
                    lte: maxAmount,
                },
                max_amount: {
                    gte: minAmount,
                },
            },
        });
    }  


    async findRequisitionById (
        purchaseRequisitionId: string
    ) {
        return prisma.purchaseRequisition.findUnique({
            where: {
                id: purchaseRequisitionId
            },
            select: {
                total_amount: true,
                tenant_id: true,
                company_id: true
            }
        })
    }

    async updateRequestStatus (
        data: UpdateRequestStatusData
    ) {
        return prisma.approvalRequest.update({
            where: {
                id: data.approval_Workflow_Id
            },
            data
        })
    }

    async createSystemWorkflowDefinitions() {
        for (const definition of SYSTEM_WORKFLOW_DEFINITION) {
            const existing =
                await prisma.approvalWorkflowDefinition.findFirst({
                    where: {
                        workflow_code: definition.workflow_code,
                        tenant_id: null,
                        is_system: true,
                    },
                });

            if (existing) {
                continue;
            }

            await prisma.approvalWorkflowDefinition.create({
                data: {
                    workflow_code: definition.workflow_code,
                    entity_type: definition.entity_type,
                    name: definition.name,
                    description: definition.description,
                    tenant_id: null,
                    company_id: null,
                    is_system: true,
                    is_active: true,
                },
            });
        }
    }

    async createApprovalWorkflowDefinition(
        data: ApprovalWorkflowDefinitionData
    ) {
        return prisma.approvalWorkflowDefinition.create({
            data: {
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                workflow_code: data.workflow_code,
                name: data.name,
                description: data.description,
                entity_type: data.entity_type,
                is_system: data.is_system,
                is_active: data.is_active,
            },
        });
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

    async getApprovalRequestById(data: ApprovalRequest) {
        return prisma.approvalRequest.findFirst({
            where: {
                id: data.approval_workflow_id,
                tenant_id: data.tenant_id
            }, select: {
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
                created_at: true,
                updated_at: true,                
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
                workflow_id: data.workflow_id,
                level_no: data.level_no,
                role_id: data.role_id,
                min_amount: data.min_amount,
                max_amount: data.max_amount,
                is_required: data.is_required                 
            }
        })
    }

    async getLevels(
        company_id: string,
        tenant_id: string
    ) {
        return prisma.approvalWorkflowLevel.findMany({
            where: {
                tenant_id: tenant_id,
                company_id: company_id
            }, select: {
                id: true,
                role_id: true,
                level_no: true,
                min_amount:true,
                max_amount:true
            }
        })
    }

    async getWorkflowCodesById(
        data: GetData
    ) {
        return prisma.approvalWorkflowDefinition.findMany({
            take: 15,
            where: {
                    tenant_id: data.tenant_id,
                    company_id: data.compnay_id
            }, select: {
                workflow_code: true,
                name: true,
                description: true,
                entity_type: true,
                is_active: true
            }
        })
    }

    async createApprovalAction(
        data: ApprovalActionData
    ) {
        return prisma.approvalAction.create({
            data: {
                level_id: data.level_id,
                tenant_id: data.tenant_id,
                approval_request_id: data.approval_request_id,
                acted_by_user_id: data.acted_by_user_id,
                action: data.action,
                remarks: data.remarks,
                acted_at: data.acted_at,
            },
        });
    }

    async getApprovalActionById (
        data: ApprovalRequest
    ) {
        return prisma.approvalAction.findUnique({
            where: {
                id: data.approval_workflow_id
            }, select: {
                level_id: true
            }
        })
    }

}