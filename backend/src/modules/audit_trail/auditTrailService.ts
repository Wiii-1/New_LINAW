import * as crypto from 'crypto'
import { AuditTrailRepository } from "./auditTrailRepository.js";
import { BlockchainAdapter } from "../../shared/blockchain/blockchainAdapter.js"
import { NotFoundError, UnauthorizedAccessError } from '../../shared/errors/appError.js';
import { auditIntegrity, searchAudit } from "./auditTrailValidator.js"

type CreateAuditTrailInput = {
    purchaseOrderId: string
    tenantId: string
    actorId: string
    entityId: string
    eventType: "COMPLETED"
}

type AnchorContext = {
    auditId: string
    tenantId: string
    hashValue: string
    eventType: "COMPLETED"
}

type AuditHashInput = {
    tenantId: string
    auditTrailId: string
    hashAlgorithm: "SHA-256"
    hashValue: string
}

type AuditRefsInput = {
    tenantId: string
    auditId: string
    transactionHash: string
    blockNumber: number
    anchoredAt: Date
}


export class AuditTrailService {
    constructor (
        private repository: AuditTrailRepository,
        private blockchainAdapter: BlockchainAdapter
    ) {}

    async searchAudit (data: searchAudit) {
        
        const { 
            audit_id, tenant_id, user_id
        } = data
 
        const audit = await this.repository.findAuditByid(audit_id)

        const user = await this.repository.findById(user_id)

        if (!user || user.tenant_id !== tenant_id) {
            throw new UnauthorizedAccessError("You do not belong to this organization")
        }

        if (!audit) {
            throw new NotFoundError("Audit trail not found")
        }        

        const blockchainRecord = await this.blockchainAdapter.getAudit(audit.id)

        return {
            audit,
            blockchain: blockchainRecord
        }
    }


    async auditIntegrity(data: auditIntegrity) {
       
        const { 
            audit_id, tenant_id, user_id
        } = data
 
        const user = await this.repository.findById(user_id)

        if (!user || user.tenant_id !== tenant_id) {
            throw new UnauthorizedAccessError("You do not belong to this organization")
        }

        const audit = await this.repository.findAuditForVerification(audit_id)

        if( !audit ) {
            throw new NotFoundError("audit not found")
        }

        if (!audit.hash || !audit.blockchain_ref) {
            throw new NotFoundError("audit relations not found")
        }

        const storedHash = audit.hash.hash_value

        const freshSnapshot = await this.repository.getPurchaseOrderSnapshot(audit.entity_id)

        if (!freshSnapshot) {
            throw new NotFoundError("purchase order snapshot not found");
}
        const freshHash = this.generateHash(freshSnapshot)

        const isFreshValid = freshHash === storedHash

        if (!isFreshValid) {
            return {
                status: "INVALID",
                reason: "Database snapshot has changed"
            }
        }
        
        // Ask blockchain for the anchored record

        const blockchainAudit = await this.blockchainAdapter.getAudit(
            audit.blockchain_ref.audit_trail_id
        )

        const isBlockchainValid = storedHash === blockchainAudit.hashValue

        return {
            status: isBlockchainValid ? "VALID" : "INVALID",
            databaseHash: storedHash,
            currentHash: freshHash,
            blockchainHash: blockchainAudit.hashValue
        }
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
    async createAuditTrail (event: CreateAuditTrailInput) {

        const purchaseOrderSnapshot = await this.repository.getPurchaseOrderSnapshot(event.purchaseOrderId)

        if (!purchaseOrderSnapshot) {
            throw new NotFoundError("Purchase order not found")
        }

        const hashValue = this.generateHash(purchaseOrderSnapshot)

        const auditRecord = {
            tenant_id: event.tenantId,
            actor_user_id: event.actorId,
            entity_type: "PURCHASE_ORDER",
            entity_id: event.entityId,
            action: event.eventType,
            result: null,
            snapshot_json: purchaseOrderSnapshot
        }

        const audit = await this.repository.createAuditTrail(auditRecord)
        
        const auditAnchor: AnchorContext = {
            auditId: audit.id,
            tenantId:event.tenantId,
            hashValue,
            eventType: event.eventType
        }

        void this.anchor(auditAnchor)
    }



    // blockchain communication and update result status 
    async anchor (input: AnchorContext) {


        const result = await this.blockchainAdapter.anchorAudit({
            auditId: input.auditId,
            hashValue: input.hashValue,
            eventType: input.eventType
        })

        await this.repository.updateAuditTrail(
            input.auditId,
            "SUCCESS"
        )

        const blockchainRefInput: AuditRefsInput = {
            tenantId: input.tenantId,
            auditId: input.auditId,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            anchoredAt: new Date(result.anchoredAt * 1000)
        }

        const audit_hash: AuditHashInput = {
            tenantId: input.tenantId,
            auditTrailId: input.auditId,
            hashAlgorithm: "SHA-256",
            hashValue: input.hashValue
        }

        void this.createAuditHash(audit_hash)
        void this.createAuditBlockchainRef(blockchainRefInput)
    }



    async createAuditHash (input: AuditHashInput) {

        await this.repository.createAuditHash({
            tenant_id: input.tenantId,
            audit_trail_id: input.auditTrailId,
            hash_algorithm: input.hashAlgorithm,
            hash_value: input.hashValue
        })
    }



    async createAuditBlockchainRef(input: AuditRefsInput) {

        await this.repository.createAuditTrailBlockchainRefs({
            tenant_id: input.tenantId,
            audit_trail_id: input.auditId,
            blockchain_transaction_hash: input.transactionHash,
            block_number: input.blockNumber,
            anchored_at: input.anchoredAt
        })
    }



    private generateHash(snapshot: object): string {

        const json = JSON.stringify(snapshot)

        return crypto
            .createHash("sha256")
            .update(json, "utf8")
            .digest("hex")
    }

}