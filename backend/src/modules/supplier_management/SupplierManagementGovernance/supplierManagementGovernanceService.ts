import { NotFoundError } from "../../../shared/errors/appError.js";
import { SupplierManagementGovernanceRepository } from "./supplierManagementGovernanceRepository.js";

interface SupplierGovernanceContext {
    tenant_id: string;
    company_id: string;
}

interface SupplierGovernanceSupplierContext
    extends SupplierGovernanceContext {
    supplier_id: string;
}

export class SupplierManagementGovernanceService {
    constructor(
        private repository: SupplierManagementGovernanceRepository,
    ) {}

    /**
     * List suppliers associated with the authenticated purchasing company.
     */
    async getSuppliers(input: SupplierGovernanceContext) {
        return this.repository.getSuppliers(input);
    }

    /**
     * Retrieve supplier details while enforcing relationship ownership.
     */
    async getSupplier(input: SupplierGovernanceSupplierContext) {
        const supplier = await this.repository.getSupplier(input);

        if (!supplier) {
            throw new NotFoundError(
                "Supplier does not exist or is not associated with this company.",
            );
        }

        return supplier;
    }

    /**
     * Deactivate an active supplier relationship without deleting records.
     */
    async removeSupplierRelationship(
        input: SupplierGovernanceSupplierContext,
    ) {
        const result = await this.repository.deactivateRelationship(input);

        if (result.count === 0) {
            throw new NotFoundError(
                "Active supplier relationship was not found.",
            );
        }

        return {
            supplier_id: input.supplier_id,
            relationship_status: "INACTIVE",
        };
    }
}
