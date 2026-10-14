import { prisma } from "../../../config/database.js";

export class SupplierManagementGovernanceRepository {
    /**
     * List active suppliers associated with the purchasing company.
     */
    async getSuppliers(input: {
        tenant_id: string;
        company_id: string;
    }) {
        return prisma.supplier.findMany({
            where: {
                status: "ACTIVE",
                company_relationships: {
                    some: {
                        tenant_id: input.tenant_id,
                        company_id: input.company_id,
                        relationship_status: "ACTIVE",
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                company: {
                    select: {
                        id: true,
                        legal_name: true,
                        display_name: true,
                        tax_id: true,
                        address: true,
                        contact_email: true,
                        contact_phone: true,
                    },
                },
            },
        });
    }

    /**
     * Retrieve one active supplier associated with the purchasing company.
     */
    async getSupplier(input: {
        tenant_id: string;
        company_id: string;
        supplier_id: string;
    }) {
        return prisma.supplier.findFirst({
            where: {
                id: input.supplier_id,
                status: "ACTIVE",
                company_relationships: {
                    some: {
                        tenant_id: input.tenant_id,
                        company_id: input.company_id,
                        relationship_status: "ACTIVE",
                    },
                },
            },
            include: {
                company: {
                    select: {
                        id: true,
                        legal_name: true,
                        display_name: true,
                        tax_id: true,
                        address: true,
                        contact_email: true,
                        contact_phone: true,
                    },
                },
            },
        });
    }

    /**
     * Deactivate the purchasing company's relationship with a supplier.
     * The supplier record and procurement history are preserved.
     */
    async deactivateRelationship(input: {
        tenant_id: string;
        company_id: string;
        supplier_id: string;
    }) {
        return prisma.supplierCompanyRelationship.updateMany({
            where: {
                tenant_id: input.tenant_id,
                company_id: input.company_id,
                supplier_id: input.supplier_id,
                relationship_status: "ACTIVE",
            },
            data: {
                relationship_status: "INACTIVE",
            },
        });
    }
}
