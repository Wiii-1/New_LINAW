import { z } from "zod"

export const RFQStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    CLOSED: "CLOSED",
    CANCELLED: "CANCELLED",
} as const;

export const RFQStatusSchema = z.enum([
    RFQStatus.DRAFT,
    RFQStatus.PUBLISHED,
    RFQStatus.CLOSED,
    RFQStatus.CANCELLED,
]);
// ====================
// Query Schema
// ====================

export const ListRFQsQuerySchema = z.object({
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
    purchase_requisition_id: z.uuid().optional(),
});

export const ListPurchaseOrdersQuerySchema = z.object({
    status: z.enum([
        "DRAFT",
        "ISSUED",
        "CANCELLED",
        "COMPLETED",
    ]).optional(),

    referenceNo: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),
});

// ====================
// Params Schema
// ====================

export const RFQIdParamsSchema = z.object({
    rfqId: z.uuid(),
});

export const QuotationParamsSchema = z.object({
    rfqId: z.uuid(),
    quotationId: z.uuid(),
});

export const PurchaseOrderIdParamsSchema = z.object({
    poId: z.uuid(),
});

// RFQ

export const CreateRFQSchema = z.object({
    purchase_requisition_id: z.uuid(),
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().max(5000).optional(),
    closing_date: z.coerce.date(),
    status:RFQStatus,
    rfq_items: z.array(
        z.object({
            line_no: z.number().int().positive(),
            description:  z.string().trim().max(5000),
            quantity: z.number().positive(),
            unit_of_measure: z.string().trim().min(1).max(50),
            specification: z.string().trim().min(1).max(5000),
        }),
    ).min(1),
});

export const UpdateRFQSchema = z.object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(5000).optional(),
    closing_date: z.coerce.date().optional(),
    rfq_items: z.array(
        z.object({
            line_no: z.number().int().positive(),
            description:  z.string().trim().max(5000),
            quantity: z.number().positive(),
            unit_of_measure: z.string().trim().min(1).max(50),
            specification: z.string().trim().min(1).max(5000),
        }),
    ).min(1).optional(),
});

// Purchase Order

export const CreatePurchaseOrderSchema = z.object({
    supplier_id: z.uuid(),
    purchase_requisition_id: z.uuid().optional(),
    rfq_id: z.uuid().optional(),
    supplier_quotation_id: z.uuid().optional(),

    currency_code: z.string().trim().length(3),

    total_amount: z.number().nonnegative(),

    order_date: z.coerce.date(),
    expected_delivery_date: z.coerce.date().optional(),

    items: z.array(
        z.object({
            line_no: z.number().int().positive(),
            description: z.string().trim().min(1).max(1000),
            quantity: z.number().positive(),
            unit_of_measure: z.string().trim().min(1).max(50),
            unit_price: z.number().nonnegative(),
            total_price: z.number().nonnegative(),
        }),
    ).min(1),
});

export const UpdatePurchaseOrderSchema = z.object({
    expected_delivery_date: z.coerce.date().optional(),
    currency_code: z.string().trim().length(3).optional(),

    items: z.array(
        z.object({
            line_no: z.number().int().positive(),
            description: z.string().trim().min(1).max(1000),
            quantity: z.number().positive(),
            unit_of_measure: z.string().trim().min(1).max(50),
            unit_price: z.number().nonnegative(),
        }),
    ).min(1).optional(),
});


export type ListRFQsQuery = 
    z.infer<typeof ListRFQsQuerySchema>

export type ListPurchaseOrdersQuery = 
    z.infer<typeof ListPurchaseOrdersQuerySchema>

export type RFQIdParams =
    z.infer<typeof RFQIdParamsSchema>

export type QuotationParams = 
    z.infer<typeof QuotationParamsSchema>

export type PurchaseOrderIdParams = 
    z.infer<typeof PurchaseOrderIdParamsSchema>

export type CreateRFQ = 
    z.infer<typeof CreateRFQSchema>

export type UpdateRFQ = 
    z.infer<typeof UpdateRFQSchema>

export type CreatePurchaseOrder = 
    z.infer<typeof CreatePurchaseOrderSchema>

export type UpdatePurchaseOrder = 
    z.infer<typeof UpdatePurchaseOrderSchema>

export type RFQStatus = 
    z.infer<typeof RFQStatusSchema>