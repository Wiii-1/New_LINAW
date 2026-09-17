import { z } from "zod"

// ===========================
// getSchema
// ===========================

export const GET_SCHEMA = z.object ({
    userId: z
        .string()
})

// ===========================
// approvalWorkflowIdParamsSchema
// ===========================

export const APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA = z.object({
    ApprovalWorkflowId: z 
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
// ApprovalWorkflowLevelCreation
// ===========================

export const APPROVAL_WORKFLOW_LEVEL_CREATION = z.object({
    workflowCode: z
        .string(),
    
    levelNo: z
        .number()
        .int()
        .positive(),
    
    roleCode: z
        .string(),

    minAmount: z
        .number()
        .positive(),

    maxAmount: z
        .number()
        .positive(),
    
    isRequired: z
        .boolean()

})

// ===========================
//  ApprovalWorkflowCode
// ===========================

export const APPROVAL_WORKFLOW_CREATION = z.object({
    workflowCode: z
        .string()
        .trim()
        .min(1, "Workflow code is required.")
        .max(100)
        .regex(
            /^[A-Z0-9_]+$/,
            "Workflow code must contain only uppercase letters, numbers, and underscores."
        ),

    name: z
        .string()
        .trim()
        .min(1, "Workflow name is required.")
        .max(150),

    description: z
        .string()
        .trim()
        .max(1000)
        .optional(),

    entityType: z
        .string()
        .trim()
        .min(1, "Entity type is required.")
        .max(100)
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
        approvalWorkflowId: string
    };

export type CreateLevels = 
    z.infer<typeof APPROVAL_WORKFLOW_LEVEL_CREATION> & {
        userId: string
    }

export type CreateWorkflow = 
    z.infer<typeof APPROVAL_WORKFLOW_CREATION> & {
        userId: string
    }
