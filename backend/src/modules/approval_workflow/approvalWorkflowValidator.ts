import { z } from "zod"

// ===========================
// approvalWorkflowIdParamsSchema
// ===========================

export const APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA = z.object({
    requisitionId: z 
        .string()
})

// ===========================
// approvalWorkflowQuerySchema
// ===========================

export const APPROVAL_WORKFLOW_QUERY_SCHEMA = z.object ({
    status: z
        .enum(["pending", "approved", "rejected", "cancelled"])
        .optional()
})

// ===========================
// rejectApprovalWorkflowBodySchema
// ===========================

export const REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA = z.object({
    remarks: z
        .string()
        .trim()
        .min(1, "Rejection remarks are required.")
        .max(1000)
})

// ===========================
// Interface types
// ===========================

export type ApprovalWorkflowIdParams =
    z.infer<typeof APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA> & {
        userId: string
    };

export type ApprovalWorkflowQuery = 
    z.infer<typeof APPROVAL_WORKFLOW_QUERY_SCHEMA> & {
        userId: string
    };

export type RejectApprovalWorkflowBody = 
    z.infer<typeof REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA> & {
        userId: string
        requisitionId: string
    };