import { z } from "zod";

// ===========================
// Shared Schemas
// ===========================

export const purchaseRequisitionIdParamsSchema = z.object({
    requisitionId: z
        .string()
        .uuid("Invalid requisition ID format.")
});

export const purchaseRequisitionLineItemSchema = z.object({
    item_id: z
        .string()
        .uuid("Invalid item ID format."),

    description: z
        .string()
        .trim()
        .min(1, "Item description is required.")
        .max(255, "Item description cannot exceed 255 characters.")
        .optional(),

    quantity: z
        .number()
        .int("Quantity must be a whole number.")
        .positive("Quantity must be greater than zero."),

    estimated_cost: z
        .number()
        .nonnegative("Estimated cost cannot be negative.")
});

// ===========================
// PATCH /purchase_requisitions/:requisitionId
// ===========================

export const updatePurchaseRequisitionBodySchema = z.object({
    justification: z
        .string()
        .trim()
        .min(10, "Justification must be at least 10 characters.")
        .max(500, "Justification cannot exceed 500 characters.")
        .optional(),

    request_date: z
        .string()
        .date("Invalid request date format.")
        .optional(),

    total_estimated_amount: z
        .number()
        .nonnegative("Amount cannot be negative.")
        .optional(),

    line_items: z
        .array(purchaseRequisitionLineItemSchema)
        .min(1, "At least one line item is required.")
        .optional()
})
.strict()
.refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided for update."
    }
);

// ===========================
// createPurchaseRequisitionSchema
// ===========================


export const createPurchaseRequisitionSchema = z.object({
    justification: z
        .string()
        .trim()
        .min(10, "Justification must be at least 10 characters.")
        .max(500),

    request_date: z
        .string()
        .date("Invalid request date format."),

    line_items: z
        .array(purchaseRequisitionLineItemSchema)
        .min(1, "At least one line item is required.")
});

// ===========================
// Types
// ===========================

export type PurchaseRequisitionIdParams =
    z.infer<typeof purchaseRequisitionIdParamsSchema>;

export type PurchaseRequisitionLineItem =
    z.infer<typeof purchaseRequisitionLineItemSchema>;

export type UpdatePurchaseRequisitionBody =
    z.infer<typeof updatePurchaseRequisitionBodySchema>;
export type createPurchaseRequisition = 
    z.infer<typeof createPurchaseRequisitionSchema>;