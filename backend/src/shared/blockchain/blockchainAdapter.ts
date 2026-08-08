import { hash } from "node:crypto";
import { auditTrailContract } from "./blockchainClient.js"; 

type AnchorAuditInput = {
    auditId: string;
    hashValue: string;
    eventType: string;
}

export class blockchainAdapter{

    async anchorAudit(
        input: AnchorAuditInput 
    ) {

        const transaction = 
            await auditTrailContract.getFunction("anchorAudit")(
                input.auditId,
                input.hashValue,
                input.hashValue
            );

        const receipt = await transaction.wait()

        return {
            transactionHash: receipt.hash
        }
    }

    async verifyAudit(
        auditId: string,
        hashValue: string
    ) {
        return await auditTrailContract.getFunction("verifyAudit")(
            auditId,
            hashValue
        )
    }

    async getAudit(
        auditId: string
    ){
        return await auditTrailContract.getFunction("getAudit")(
            auditId
        )
    }
}