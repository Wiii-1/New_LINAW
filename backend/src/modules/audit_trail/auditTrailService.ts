import { AuditTrailRepository } from "./auditTrailRepository.js";
import { BlockchainAdapter } from "../../shared/blockchain/blockchainAdapter.js";
import {
  NotFoundError,
  UnauthorizedAccessError,
} from "../../shared/errors/appError.js";
import type {
  auditIntegrity,
  listAudit,
  searchAudit,
} from "./auditTrailValidator.js";

type CreateAuditTrailInput = {
  purchaseOrderId: string;
  tenantId: string;
  actorId: string;
  entityId: string;
  eventType: "COMPLETED";
};

type AnchorContext = {
  auditId: string;
  tenantId: string;
  hashValue: string;
  eventType: "COMPLETED";
};

type AuditHashInput = {
  tenantId: string;
  auditTrailId: string;
  hashAlgorithm: "SHA-256";
  hashValue: string;
};

type AuditRefsInput = {
  tenantId: string;
  auditId: string;
  transactionHash: string;
  blockNumber: number;
  anchoredAt: Date;
};

export class AuditTrailService {
  constructor(
    private repository: AuditTrailRepository,
    private blockchainAdapter: BlockchainAdapter,
  ) {}

  async listAudits(data: listAudit) {
    const { page, page_size, tenant_id, company_id } = data;
    const skip = (page - 1) * page_size;

    const result = await this.repository.listAudits({
      tenantId: tenant_id,
      companyId: company_id,
      entityType: data.entity_type,
      action: data.action,
      result: data.result,
      skip,
      take: page_size,
    });

    const auditTrails = result.records.map((record) => ({
      ...record,
      blockchain_ref: record.blockchain_ref
        ? {
            ...record.blockchain_ref,
            block_number:
              record.blockchain_ref.block_number?.toString() ?? null,
          }
        : null,
    }));

    return {
      audit_trails: auditTrails,
      pagination: {
        page,
        page_size,
        total: result.total,
        total_pages: Math.ceil(result.total / page_size),
      },
    };
  }

  async searchAudit(data: searchAudit) {
    const { audit_id, tenant_id, company_id, user_id } = data;

    const audit = await this.repository.findAuditByid(
      audit_id,
      tenant_id,
      company_id,
    );

    const user = await this.repository.findById(user_id);

    if (!user || user.tenant_id !== tenant_id) {
      throw new UnauthorizedAccessError(
        "You do not belong to this organization",
      );
    }

    if (!audit) {
      throw new NotFoundError("Audit trail not found");
    }

    const blockchainRecord = await this.blockchainAdapter.getAudit(audit.id);

    return {
      audit,
      blockchain: blockchainRecord,
    };
  }

  async auditIntegrity(data: auditIntegrity) {
    const { audit_id, tenant_id, company_id, user_id } = data;

    const user = await this.repository.findById(user_id);

    if (!user || user.tenant_id !== tenant_id) {
      throw new UnauthorizedAccessError(
        "You do not belong to this organization",
      );
    }

    const audit = await this.repository.findAuditForVerification(
      audit_id,
      tenant_id,
      company_id,
    );

    if (!audit) {
      throw new NotFoundError("audit not found");
    }

    if (!audit.hash || !audit.blockchain_ref) {
      throw new NotFoundError("audit relations not found");
    }

    const storedHash = audit.hash.hash_value;

    const freshSnapshot = await this.repository.getPurchaseOrderSnapshot(
      audit.entity_id,
    );

    if (!freshSnapshot) {
      throw new NotFoundError("purchase order snapshot not found");
    }
    const freshHash = await this.generateHash(freshSnapshot);

    const isFreshValid = freshHash === storedHash;

    if (!isFreshValid) {
      return {
        status: "INVALID",
        reason: "Database snapshot has changed",
      };
    }

    // Ask blockchain for the anchored record

    const blockchainAudit = await this.blockchainAdapter.getAudit(
      audit.blockchain_ref.audit_trail_id,
    );

    const isBlockchainValid = storedHash === blockchainAudit.hashValue;

    return {
      status: isBlockchainValid ? "VALID" : "INVALID",
      databaseHash: storedHash,
      currentHash: freshHash,
      blockchainHash: blockchainAudit.hashValue,
    };
  }

  /*
        dev_note @Wiii-1 :

        if more modules require auditing:

        - add new snapshot shape in repository layer
        - add new entity_type
        - extend the snapshot generation logic

        possible implementation:

        switch(entity_type)

            PURCHASE_ORDER:
                getPurchaseOrderSnapshot()

            INVOICE_VERIFICATION:
                getInvoiceVerificationSnapshot()

            SUPPLIER:
                getSupplierSnapshot()


        This keeps AuditTrail generic while allowing
        each module to define its own snapshot structure.
    */

  // purchase order
  async createAuditTrail(event: CreateAuditTrailInput) {
    const purchaseOrderSnapshot =
      await this.repository.getPurchaseOrderSnapshot(event.purchaseOrderId);

    if (!purchaseOrderSnapshot) {
      throw new NotFoundError("Purchase order not found");
    }

    const hashValue = await this.generateHash(purchaseOrderSnapshot);

    const auditRecord = {
      tenant_id: event.tenantId,
      actor_user_id: event.actorId,
      entity_type: "PURCHASE_ORDER",
      entity_id: event.entityId,
      action: event.eventType,
      result: null,
      snapshot_json: purchaseOrderSnapshot,
    };

    const audit = await this.repository.createAuditTrail(auditRecord);

    const auditAnchor: AnchorContext = {
      auditId: audit.id,
      tenantId: event.tenantId,
      hashValue,
      eventType: event.eventType,
    };

    await this.anchor(auditAnchor);
  }

  // blockchain communication and update result status
  async anchor(input: AnchorContext) {
    try {
      const result = await this.blockchainAdapter.anchorAudit({
        auditId: input.auditId,
        hashValue: input.hashValue,
        eventType: input.eventType,
      });

      const blockchainRefInput: AuditRefsInput = {
        tenantId: input.tenantId,
        auditId: input.auditId,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        anchoredAt: new Date(result.anchoredAt * 1000),
      };

      const auditHash: AuditHashInput = {
        tenantId: input.tenantId,
        auditTrailId: input.auditId,
        hashAlgorithm: "SHA-256",
        hashValue: input.hashValue,
      };

      await Promise.all([
        this.createAuditHash(auditHash),
        this.createAuditBlockchainRef(blockchainRefInput),
      ]);

      await this.repository.updateAuditTrail(input.auditId, "SUCCESS");
    } catch (error) {
      try {
        await this.repository.updateAuditTrail(input.auditId, "FAILED");
      } catch (statusError) {
        console.error("Failed to update audit status", statusError);
      }

      throw error;
    }
  }

  async createAuditHash(input: AuditHashInput) {
    await this.repository.createAuditHash({
      tenant_id: input.tenantId,
      audit_trail_id: input.auditTrailId,
      hash_algorithm: input.hashAlgorithm,
      hash_value: input.hashValue,
    });
  }

  async createAuditBlockchainRef(input: AuditRefsInput) {
    await this.repository.createAuditTrailBlockchainRefs({
      tenant_id: input.tenantId,
      audit_trail_id: input.auditId,
      blockchain_transaction_hash: input.transactionHash,
      block_number: input.blockNumber,
      anchored_at: input.anchoredAt,
    });
  }

  private async generateHash(snapshot: object): Promise<string> {
    const json = JSON.stringify(snapshot);

    const data = new TextEncoder().encode(json);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}
