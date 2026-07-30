import { prisma } from "../../config/database.js";


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
        approved_by: string;
        action: string;
        timestamp: Date;
    }[];

    receipt: {
        receipt_number: string;
        receipt_date: Date;
        received_by: string;
    } | null;
}

export type audit_trail_input = {
    tenant_id: string;
    actor_user_id?: string;
    entity_type: string;
    entity_id: string;
    action: string;
    result: string;
    details_json?: object;
};

export type audit_hashes_input = {
    tenant_id: string;
    audit_trail_id: string;
    hash_algorithm: string;
    hash_value: string;
    created_at: Date;
}

export type audit_trail_blockchain_refs_input = {
    tenand_id: string;
    audit_trail_id: string;
    network_ref: string;
    blockchain_transaction_hash: string;
    block_number: number;
    anchored_at: Date;
}

export class AuditTrailRepository {

    async getPurchaseOrderSnapshot(
        purchaseOrderId: string
    ): Promise<PurchaseOrderSnapshot | null> {

        const po = await prisma.purchase_order.findUnique({
            where: {
                id: purchaseOrderId
            },
            include: {
                company: true,
                supplier: true,
                items: true,
                approvals: {
                    include: {
                        approvedByUser: true
                    }
                },
                goodsReceipts: {
                    include: {
                        receivedByUser: true
                    }
                }
            }
        });

        if (!po) {
            return null;
        }

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

            items: po.items.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                price: Number(item.unit_price),
                total_price: Number(item.total_price)
            })),

            approvals: po.approvals.map((action) => ({
                approved_by: action.approvedByUser.id,
                action: action.action,
                timestamp: action.acted_at
            })),
            
            receipt: po.goodsReceipts[0]
                ? {
                    receipt_number: po.goodsReceipts[0].receipt_number,
                    receipt_date: po.goodsReceipts[0].receipt_date,
                    received_by: po.goodsReceipts[0].receivedByUser.id
                }
                : null
        };
    }

    async createAuditTrail (
        data: audit_trail_input
    ) {
        return prisma.audit_trail.create({
            data
        })
    }

    async createAuditHash (
        data: audit_hashes_input
    ) {
        return prisma.audit_trail_hashes.create({
            data
        })
    }

    async createAuditTrailBlockchainRefs (
        data: audit_trail_blockchain_refs_input
    ) {
        return prisma.audit_trail_blockchain_refs.create({
            data
        })
    }
}

