import { z } from "zod";

// ===========================
// Shared Schemas
// ===========================

export const purchaseRequisitionIdParamsSchema = z.object({
    requisitionId: z
        .string()
});

// ===========================
// Domain Values
// ===========================

// Replace these values with the actual values used by your application.
export const purchaseRequisitionPrioritySchema = z.enum([
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT"
]);

// Replace these values with the actual values used by your application.
export const purchaseRequisitionItemTypeSchema = z.enum([
    "GOODS",
    "SERVICE",
    "ASSET"
]);

export const purchaseRequisitionStatusSchema = z.enum([
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
]);

// ===========================
// Decimal Validation
// ===========================

// Prisma:
// Decimal(18, 4)
// Allows up to 4 decimal places.
const quantitySchema = z
    .number()
    .finite("Quantity must be a valid number.")
    .positive("Quantity must be greater than zero.")
    .refine(
        (value) => Number.isInteger(value * 10_000),
        "Quantity cannot have more than 4 decimal places."
    );

// Prisma:
// Decimal(18, 2)
// Allows up to 2 decimal places.
const estimatedUnitCostSchema = z
    .number()
    .finite("Estimated unit cost must be a valid number.")
    .nonnegative("Estimated unit cost cannot be negative.")
    .refine(
        (value) => Number.isInteger(value * 100),
        "Estimated unit cost cannot have more than 2 decimal places."
    );

// ===========================
// Purchase Requisition Item
// ===========================

export const purchaseRequisitionItemSchema = z
    .object({
        item_type: purchaseRequisitionItemTypeSchema,

        description: z
            .string()
            .trim()
            .min(1, "Item description is required.")
            .max(
                255,
                "Item description cannot exceed 255 characters."
            ),

        specification: z
            .string()
            .trim()
            .max(
                1000,
                "Specification cannot exceed 1000 characters."
            ),

        quantity: quantitySchema,

        unit_of_measure: z
            .string()
            .trim()
            .min(1, "Unit of measure is required.")
            .max(
                50,
                "Unit of measure cannot exceed 50 characters."
            ),

        estimated_unit_cost: estimatedUnitCostSchema,

        category_id: z
            .string()
            .uuid("Invalid category ID format.")
            .optional(),

        needed_by_date: z
            .string()
            .date("Invalid needed-by date format.")
            .optional()
    })
    .strict();

// ===========================
// Purchase Requisition Input
// ===========================

export const purchaseRequisitionInputSchema = z
    .object({
        purpose: z
            .string()
            .trim()
            .max(
                500,
                "Purpose cannot exceed 500 characters."
            ),

        justification: z
            .string()
            .trim()
            .min(
                10,
                "Justification must be at least 10 characters."
            )
            .max(
                500,
                "Justification cannot exceed 500 characters."
            ),

        priority: purchaseRequisitionPrioritySchema,

        currency_code: z
            .string()
            .trim()
            .length(
                3,
                "Currency code must be 3 characters."
            )
            .toUpperCase(),

        needed_by_date: z
            .string()
            .date("Invalid needed-by date format.")
            .optional(),

        items: z
            .array(purchaseRequisitionItemSchema)
            .min(1, "At least one item is required."),

        remarks: z
        .string()
        .trim()
        .max(500, "Cancellation remarks cannot exceed 500 characters.")

    })
    .strict();

// ===========================
// Update Schema
// ===========================

export const updatePurchaseRequisitionSchema = z.object({
    purpose: z
        .string()
        .trim()
        .max(500)
        .optional(),

    justification: z
        .string()
        .trim()
        .min(10)
        .max(500)
        .optional(),

    priority: purchaseRequisitionPrioritySchema.optional(),

    needed_by_date: z
        .string()
        .date("Invalid needed-by date format.")
        .optional(),

    remarks: z
        .string()
        .trim()
        .max(500, "Cancellation remarks cannot exceed 500 characters.")
}).strict();

export const PurchaseRequisitionStatusSchema = z.object({
    status:purchaseRequisitionStatusSchema
})

export const cancelPurchaseRequisitionSchema = z.object({
    remarks: z
        .string()
        .trim()
        .max(500, "Cancellation remarks cannot exceed 500 characters.")
}).strict();

// ===========================
// Query Schema
// ===========================

export const PurchaseRequisitionQuerySchema = z.object({
    status: purchaseRequisitionStatusSchema.optional(),

    requesterId: z
        .string()
        .uuid()
        .optional(),

    pr_number: z
        .string()
        .trim()
        .min(1)
        .optional(),
});

// ===========================
// Types
// ===========================

export type PurchaseRequisitionQuery = 
    z.infer<typeof PurchaseRequisitionQuerySchema> & {
        userId: string
        tenantId: string
    }

export type PurchaseRequisitionIdParams =
    z.infer<typeof purchaseRequisitionIdParamsSchema> & {
        userId: string
    };

export type PurchaseRequisitionItem =
    z.infer<typeof purchaseRequisitionItemSchema>;

export type PurchaseRequisitionInput =
    z.infer<typeof purchaseRequisitionInputSchema> & {
        userId: string;
        tenantId: string;
    };

export type ResubmitPurchaseRequisitionInput =
    z.infer<typeof purchaseRequisitionInputSchema> & {
        userId: string;
        requisitionId: string;
    };

export type PurchaseRequisitionUpdateData =
    z.infer<typeof updatePurchaseRequisitionSchema>;

export type PurchaseRequisitionUpdate =
    z.infer<typeof updatePurchaseRequisitionSchema>;

export type PurchaseRequisitionStatusUpdate =
    z.infer<typeof PurchaseRequisitionStatusSchema>;

export type CancelPurchaseRequisitionInput =
    z.infer<typeof cancelPurchaseRequisitionSchema> & {
        requisitionId: string;
        userId: string;
    };