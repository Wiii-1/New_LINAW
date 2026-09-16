import { ethers } from "ethers";

import type { AppEnv } from "../../config/env.js";
import { createAuditTrailContract } from "./blockchainClient.js"; 

type AnchorAuditInput = {
    auditId: string;
    hashValue: string;
    eventType: string;
}

export class BlockchainAdapter{

    async anchorAudit(
        env: AppEnv,
        input: AnchorAuditInput
    ) {

        const auditTrailContract = createAuditTrailContract(env);

        // UUID/String - byte32

        const auditIdbyte32 = ethers.id(
            input.auditId
        )

        // SHA 256 hex - byte32

        const hashValueByte32 = 
            input.hashValue.startsWith("0x") 
                ? input.hashValue
                : `0x${input.hashValue}`

        if (!/^0x[0-9a-fA-F]{64}$/.test(hashValueByte32)) {
        throw new Error(
            "Invalid hashValue: expected a 32-byte hexadecimal hash"
        );
    }

        const transaction = 
            await auditTrailContract.getFunction("anchorAudit")(
                input.auditId,
                input.hashValue,
                input.eventType
            );

        const receipt = await transaction.wait()

        const block = await auditTrailContract.runner?.provider?.getBlock(receipt.blockNumber)

        if (!block) {
            throw new Error("Block not found")
        }

        return {
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            anchoredAt: block.timestamp
        }
    }

    async verifyAudit(
        env: AppEnv,
        auditId: string,
        hashValue: string
    ) {

        const auditTrailContract = createAuditTrailContract(env);        

        const auditIdBytes32 = ethers.id(
            auditId
        );

        const hashValueBytes32 =
            hashValue.startsWith("0x")
                ? hashValue
                : `0x${hashValue}`;

        if (!/^0x[0-9a-fA-F]{64}$/.test(hashValueBytes32)) {
            throw new Error(
                "Invalid hashValue: expected a 32-byte hexadecimal hash"
            );
        }

        return await auditTrailContract.getFunction("verifyAudit")(
            auditId,
            hashValue
        )
    }

    async getAudit(
        env: AppEnv,
        auditId: string
    ){
        const auditTrailContract = createAuditTrailContract(env);

        return await auditTrailContract.getFunction("getAudit")(
            auditId
        )
    }
}

export const blockchainAdapter = new BlockchainAdapter()