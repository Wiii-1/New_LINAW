import * as crypto from 'crypto'
import { AuditTrailRepository } from "./auditTrailRepository.js";
import { AuditTrailBlockchainAdapter } from "./auditTrailBlockchainAdapter.js"
import { NotFoundError } from '../../shared/errors/appError.js';
import { auditIntegrity, searchAudit } from "./auditTrailValidator.js"


export class AuditTrailService {
    constructor (
        private repository: AuditTrailRepository,
        private readonly blockchainAdapter: AuditTrailBlockchainAdapter
    ) {}

    async searchAudit (data: searchAudit) {
        /*
            basically a search function lng para sa blockchain adapter

            purpose:
                - used to locate an existing audit record
                - forwards the search request to the blockchain adapter
                - retrieves the anchored record/reference

            flow:

            1. receives search request from user/system

            2. forwards the audit identifier/search criteria
               to the blockchain adapter

            3. adapter queries blockchain

            4. returns blockchain audit record
               (auditId, hashValue, eventType, anchoredAt)

            5. return result
        */
        
        const { id } = data
 
        const searchAudit = await this.repository.findAuditByid(id)


        if (!searchAudit) {
            throw new NotFoundError("Audit trail not found")
        }

        const searchAuditRecord = await this.blockchainAdapter.search(searchAudit)

        return searchAuditRecord 
    }


    async auditIntegrity(data: auditIntegrity) {
        /*
            checks if the current database data is still matching
            the original anchored snapshot

            flow:
            verifies if the current database snapshot still matches
            the original hash anchored on the blockchain

            flow:

            1. receives audit verification request

            2. gets audit id from request

            3. retrieves audit record and snapshot metadata from database

            4. forwards blockchain reference / audit id to blockchain adapter

            5. retrieves original hash stored on blockchain

            6. generates a new hash from the current database snapshot

            7. compares:

                    blockchain stored hash
                            |
                            |
                            v
                    newly generated database hash


            8. returns verification result:

                    VALID
                    INVALID / TAMPERED
        */

        const audit = await this.repository.findAuditForVerification(
            data.id
        )

        if( !audit ) {
            throw new NotFoundError("audit not found")
        }

        const storedHash = audit.AuditTrailHash.hash_value

        const freshSnapshot = await this.repository.getPurchaseOrderSnapshot(audit)

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
            audit.AuditTrailBlockchainRef.audit_trail_id
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
    async createAuditTrail (trigger: string) {

        /*
            receives trigger from purchase_order_management

            example:

            {
                tenant_id,
                actor_user_id,

                entity_type: "PURCHASE_ORDER",
                entity_id: purchaseOrder.id,

                action: "COMPLETED",
                result: "SUCCESS",

                request_id
            }


            flow:


            1. receives completed event from purchase order module


            2. queries repository layer using entity_id

                example:

                getPurchaseOrderSnapshot(
                    purchaseOrder.id
                )


            3. receives snapshot JSON


            4. generates cryptographic hash

                snapshot
                    |
                    v
                SHA-256
                    |
                    v
                hashValue


            5. creates base audit_trail record

                stores:

                - tenant
                - actor
                - entity
                - action
                - snapshot_json


            6. sends audit id + hash to anchor()


            7. receives blockchain result

                - transaction hash
                - block number
                - anchored timestamp


            8. stores:

                - audit hash
                - blockchain reference


            9. audit creation completed
        */

    }



    // blockchain communication only
    async anchor () {

        /*
            responsible only for forwarding data
            to blockchain adapter


            receives:

                1. audit id

                2. hash value

                3. event type


            sends to blockchain adapter:

                anchorAudit(
                    auditId,
                    hashValue,
                    eventType
                )


            adapter handles:

                - contract interaction
                - waiting for transaction receipt
                - retrieving block information


            returns:

                {
                    transaction_hash,
                    block_number,
                    anchored_at
                }

        */
    }



    async createAuditHash () {

        /*
            stores generated hash into database


            receives:

                - tenant_id
                - audit_trail_id
                - hash_algorithm
                - hash_value


            flow:

            1. receives generated hash from createAuditTrail()

            2. forwards hash information to repository

            3. stores hash reference linked to audit_trail


            purpose:

                keeps database copy of the hash
                for faster verification
        */

    }



    async createAuditBlockchainRef() {

        /*
            stores blockchain proof reference


            receives from anchor():

                - audit_trail_id
                - transaction_hash
                - block_number
                - anchored_at


            flow:

            1. receives blockchain receipt data

            2. forwards data to repository

            3. stores blockchain reference


            purpose:

                connects database audit record
                to its immutable blockchain proof

        */

    }



    private generateHash(snapshot: object): string {

        /*
            converts snapshot into deterministic string

            then generates SHA-256 hash


            flow:

                snapshot JSON

                    |

                    v

                JSON.stringify()

                    |

                    v

                SHA-256

                    |

                    v

                hexadecimal hash string


            NOTE:

                future improvement:
                canonicalize JSON before hashing

                to prevent different property ordering
                producing different hashes.

        */


        const json = JSON.stringify(snapshot)

        return crypto
            .createHash("sha256")
            .update(json, "utf8")
            .digest("hex")
    }

}