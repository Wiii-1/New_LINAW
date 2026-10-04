import { prisma } from "../../config/database.js";
import {
    RFQStatus,
    type ListPurchaseOrdersQuery,
    type ListRFQsQuery,
} from "./purchaseOrderManagementValidator.js"

interface CreatePurchaseOrderContext {

    id: string;
    tenant_id: string;
    company_id: string;

    po_number: string;
    issued_by_user_id: string;
    status: string;

    supplier_id: string;
    rfq_id: string | undefined;
    purchase_requisition_id: string | undefined;
    supplier_quotation_id: string | undefined;

    currency_code: string;
    total_amount: number;

    order_date: Date;
    expected_delivery_date: Date | undefined;

    items: {
        tenant_id: string;
        purchase_order_id: string
        line_no: number;
        description: string;
        quantity: number;
        unit_of_measure: string;
        unit_price: number;
        total_price: number;
        status: string;
    }[];
    
}

interface CreateRFQSContext {
    id: string;
    tenant_id: string;
    company_id: string;

    rfq_number: string;
    purchase_requisition_id: string;
    created_by_user_id: string;

    title: string;
    description: string | undefined;
    closing_date: Date;
    status: string;
    created_at: Date;

    items: {
        tenant_id: string;
        line_no: number;
        description: string;
        quantity: number;
        unit_of_measure: string;
        specification: string;
    }[];
}

interface QuotationContext {
    quotation_id: string
    tenant_id: string
    company_id: string
}

interface RFQContext {
    rfq_id: string
    tenant_id: string
    company_id: string
}


interface POContext {
    po_id: string
    tenant_id: string
    company_id: string
}


interface SupplierSelectionContext {
    tenant_id: string
    company_id: string
    rfq_id: string
    quotation_id: string
    supplier_id: string
}

interface PublishContext {
    tenant_id: string;
    company_id: string;
    rfq_id: string;
}

interface PoQueryContext {
    tenant_id: string
    company_id: string
    query?: ListPurchaseOrdersQuery
}

interface RfqQueryContext {
    tenant_id: string
    company_id: string
    query?: ListRFQsQuery
}

interface QuotationsListContext {
    tenant_id: string
    company_id: string
    rfq_id: string
}

interface GetQuotationContext {
    tenant_id: string
    company_id: string
    rfq_id: string
    quotation_id: string
}

interface UpdateRfqsContext {
    rfq_id: string;
    tenant_id: string;
    company_id: string;
    title: string | undefined;
    description: string | undefined;
    closing_date: Date | undefined;
    items: {
        line_no: number;
        description: string;
        quantity: number;
        unit_of_measure: string;
        specification: string;
    }[] | undefined;
}

interface UpdatePoContext  {
    po_id: string;
    tenant_id: string;
    company_id: string;
    expected_delivery_date: Date | undefined;
    currency_code: string | undefined;
    items: {
        line_no: number;
        description: string;
        quantity: number;
        unit_of_measure: string;
        unit_price: number;
    }[] | undefined;
}


export class PurchaseOrderManagementRepository {

    // Create

    async createPurchaseOrder(
        data: CreatePurchaseOrderContext
    ) {
        return prisma.purchaseOrder.create({
            data: {
                id: data.id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                supplier_id: data.supplier_id,

                purchase_requisition_id: data.purchase_requisition_id,
                rfq_id: data.rfq_id,
                supplier_quotation_id: data.supplier_quotation_id,

                po_number: data.po_number,
                issued_by_user_id: data.issued_by_user_id,
                status: data.status,

                currency_code: data.currency_code,
                total_amount: data.total_amount,

                order_date: data.order_date,
                expected_delivery_date: data.expected_delivery_date,

                items: {
                    create: data.items,
                },
            },
        });
    }

    async createRFQS(
        data: CreateRFQSContext
    ) {
        return prisma.rFQ.create({
            data: {
                id: data.id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,

                rfq_number: data.rfq_number,
                purchase_requisition_id: data.purchase_requisition_id,
                created_by_user_id: data.created_by_user_id,

                title: data.title,
                description: data.description,
                closing_date: data.closing_date,
                status: data.status,
                created_at: data.created_at,

                items: {
                    create: data.items,
                },
            },
        });
    }


    // Find

    async findRfqById(data: RFQContext) {
        return prisma.rFQ.findFirst({
            where: {
                id: data.rfq_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            include: {
                items: true,
            },
        });
    }

    async findQuotationById(data: QuotationContext) {
        return prisma.supplierQuotation.findFirst({
            where: {
                id: data.quotation_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
        });
    }

    async findPoById(data: POContext) {
        return prisma.purchaseOrder.findFirst({
            where: {
                id: data.po_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
        });
    }

    // Publish / Selection

    async publishRfq(data: PublishContext) {
        const rfq = await prisma.rFQ.findFirst({
            where: {
                id: data.rfq_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            select: {
                id: true,
            },
        });

        if (!rfq) {
            return null;
        }

        return prisma.rFQ.update({
            where: {
                id: rfq.id,
            },
            data: {
                status: RFQStatus.PUBLISHED,
            },
            include: {
                items: true,
            },
        });
    }

    async selectSupplier(data: SupplierSelectionContext) {
        const quotation = await prisma.supplierQuotation.findFirst({
            where: {
                id: data.quotation_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                rfq_id: data.rfq_id,
                supplier_id: data.supplier_id,
            },
            select: {
                id: true,
            },
        });

        if (!quotation) {
            return null;
        }

        return prisma.supplierQuotation.update({
            where: {
                id: quotation.id,
            },
            data: {
                status: "SELECTED",
            },
        });
    }

    // Query

    async getList(data: PoQueryContext) {
        return prisma.purchaseOrder.findMany({
            where: {
                tenant_id: data.tenant_id,
                company_id: data.company_id,

                ...(data.query?.status && {
                    status: data.query.status,
                }),

                ...(data.query?.referenceNo && {
                    po_number: {
                        contains: data.query.referenceNo,
                        mode: "insensitive",
                    },
                }),
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                items: true,
            },
        });
    }

    async getRFQS(data: RfqQueryContext) {
        return prisma.rFQ.findMany({
            where: {
                tenant_id: data.tenant_id,
                company_id: data.company_id,

                ...(data.query?.status && {
                    status: data.query.status,
                }),

                ...(data.query?.purchase_requisition_id && {
                    purchase_requisition_id: data.query.purchase_requisition_id,
                }),
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                items: true,
            },
        });
    }

    async getQuotationList(data: QuotationsListContext) {
        return prisma.supplierQuotation.findMany({
            where: {
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                rfq_id: data.rfq_id,
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                items: true,
            },
        });
    }

    async getQuotation(data: GetQuotationContext) {
        return prisma.supplierQuotation.findFirst({
            where: {
                id: data.quotation_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
                rfq_id: data.rfq_id,
            },
            include: {
                items: true,
            },
        });
    }

    async getPO(data: POContext) {
        return prisma.purchaseOrder.findFirst({
            where: {
                id: data.po_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            include: {
                items: true,
            },
        });
    }


    // Update

    async updateRFQS(data: UpdateRfqsContext) {
        const rfq = await prisma.rFQ.findFirst({
            where: {
                id: data.rfq_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            select: {
                id: true,
            },
        });

        if (!rfq) {
            return null;
        }

        return prisma.$transaction(async (tx) => {
            const updatedRfq = await tx.rFQ.update({
                where: {
                    id: rfq.id,
                },
                data: {
                    ...(data.title !== undefined && {
                        title: data.title,
                    }),

                    ...(data.description !== undefined && {
                        description: data.description,
                    }),

                    ...(data.closing_date !== undefined && {
                        closing_date: data.closing_date,
                    }),
                },
            });

            if (data.items !== undefined) {
                for (const item of data.items) {
                    await tx.rFQItem.updateMany({
                        where: {
                            rfq_id: rfq.id,
                            tenant_id: data.tenant_id,
                            line_no: item.line_no,
                        },
                        data: {
                            description: item.description,
                            quantity: item.quantity,
                            unit_of_measure: item.unit_of_measure,
                            specification: item.specification,
                        },
                    });
                }
            }

            return updatedRfq;
        });
    }

    async updatePO(data: UpdatePoContext) {
        const po = await prisma.purchaseOrder.findFirst({
            where: {
                id: data.po_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            select: {
                id: true,
            },
        });

        if (!po) {
            return null;
        }

        return prisma.$transaction(async (tx) => {
            let totalAmount: number | undefined;

            if (data.items !== undefined) {
                totalAmount = data.items.reduce(
                    (total, item) =>
                        total + item.quantity * item.unit_price,
                    0,
                );

                for (const item of data.items) {
                    await tx.purchaseOrderItem.updateMany({
                        where: {
                            purchase_order_id: po.id,
                            tenant_id: data.tenant_id,
                            line_no: item.line_no,
                        },
                        data: {
                            description: item.description,
                            quantity: item.quantity,
                            unit_of_measure: item.unit_of_measure,
                            unit_price: item.unit_price,
                            total_price: item.quantity * item.unit_price,
                        },
                    });
                }
            }

            return tx.purchaseOrder.update({
                where: {
                    id: po.id,
                },
                data: {
                    ...(data.expected_delivery_date !== undefined && {
                        expected_delivery_date: data.expected_delivery_date,
                    }),

                    ...(data.currency_code !== undefined && {
                        currency_code: data.currency_code,
                    }),

                    ...(totalAmount !== undefined && {
                        total_amount: totalAmount,
                    }),
                },
                include: {
                    items: true,
                },
            });
        });
    }

    // Delete

    async deleteRfq(data: RFQContext) {
        const rfq = await prisma.rFQ.findFirst({
            where: {
                id: data.rfq_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            select: {
                id: true,
            },
        });

        if (!rfq) {
            return null;
        }

        return prisma.rFQ.update({
            where: {
                id: rfq.id,
            },
            data: {
                status: RFQStatus.CANCELLED,
            },
        });
    }

    async deletePo(data: POContext) {
        const po = await prisma.purchaseOrder.findFirst({
            where: {
                id: data.po_id,
                tenant_id: data.tenant_id,
                company_id: data.company_id,
            },
            select: {
                id: true,
            },
        });

        if (!po) {
            return null;
        }

        return prisma.purchaseOrder.update({
            where: {
                id: po.id,
            },
            data: {
                status: "CANCELLED",
            },
        });
    }

}