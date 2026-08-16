import { prisma } from "../../config/database.js";
import { Prisma } from "../../generated/prisma/client.js";

type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
    include: {
        company: true;
        supplier: true;
        items: true;
        approvals: {
            include: {
                approved_by_user: true;
            };
        };
        goods_receipts: {
            include: {
                received_by_user: true;
            };
        };
    };
}>;


export type PurchaseOrderSnapshot = {
    purchase_order_id: string;
    po_number: string;

    company: {
        id: string;
        name: string;
    };

    supplier: {
        id: string;
        name: string;
    };

    currency_code: string;
    final_amount: number;
    order_date: Date;

    items: {
        description: string;
        quantity: number;
        price: number;
        total_price: number;
    }[];

    approvals: {
        approved_by: {
            id: string,
            name: string
        };
        action: string;
        timestamp: Date;
    }[];

    receipt: {
        receipt_number: string;
        receipt_date: Date;
        received_by: string;
    } | null;
}

type audit_trail_input = {
    tenant_id: string;
    actor_user_id: string | null;
    entity_type: string;
    entity_id: string;
    action: string;
    result: string | null;
    snapshot_json: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
};

export type audit_hashes_input = {
    tenant_id: string;
    audit_trail_id: string;
    hash_algorithm: string;
    hash_value: string;
}

export type audit_trail_blockchain_refs_input = {
    tenant_id: string;
    audit_trail_id: string;
    network_ref?: string | null ;
    blockchain_transaction_hash: string;
    block_number: number;
    anchored_at: Date;
}

export class AuditTrailRepository {

    async findAuditByid (
        auditId: string
    ) {
        return prisma.auditTrail.findUnique({
            where:{
                id: auditId
            }
        })
    }

    async getPurchaseOrderSnapshot(
        purchaseOrderId: string
    ): Promise<PurchaseOrderSnapshot | null> {

        const po: PurchaseOrderWithRelations | null =
            await prisma.purchaseOrder.findUnique({
                where: {
                    id: purchaseOrderId
                },
                include: {
                    company: true,
                    supplier: true,
                    items: true,
                    approvals: {
                        include: {
                            approved_by_user: true
                        }
                    },
                    goods_receipts: {
                        include: {
                            received_by_user: true
                        }
                    }
                }
            });

        if (!po) {
            return null;
        }

        const items = po.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            price: Number(item.unit_price),
            total_price: Number(item.total_price)
        }));

        const approvals = po.approvals.map((action) => ({
            approved_by: {
                id: action.approved_by_user.id,
                name: action.approved_by_user.last_name
            },
            action: action.action,
            timestamp: action.acted_at
        }));

        return {
            purchase_order_id: po.id,
            po_number: po.po_number,

            company: {
                id: po.company.id,
                name: po.company.display_name
            },

            supplier: {
                id: po.supplier.id,
                name: po.supplier.display_name
            },

            currency_code: po.currency_code,
            final_amount: Number(po.total_amount),
            order_date: po.order_date,

            items,
            approvals,

            receipt: po.goods_receipts[0]
                ? {
                    receipt_number: po.goods_receipts[0].receipt_number,
                    receipt_date: po.goods_receipts[0].receipt_date,
                    received_by: po.goods_receipts[0].received_by_user.id
                }
                : null
        };
    }

    async findAuditForVerification (
        audit_id: string
    ){
        return prisma.auditTrail.findUnique({
            where: {
                id: audit_id,
            },
            include: {
                hash: true,
                blockchain_ref: true,
            },
        });
    };

    async createAuditTrail (
        data: audit_trail_input
    ) {
        return prisma.auditTrail.create({
            data,
            select: {
                id: true
            }
        })
    }

    async updateAuditTrail (
        audit_id: string,
        result: string
    ){
        return prisma.auditTrail.update({
            where: {
                id: audit_id
            },
            data: {
                result
            }
        })
    }

    async createAuditHash (
        data: audit_hashes_input
    ) {
        return prisma.auditTrailHash.create({
            data
        })
    }

    async createAuditTrailBlockchainRefs (
        data: audit_trail_blockchain_refs_input
    ) {
        return prisma.auditTrailBlockchainRef.create({
            data
        })
    }
}

