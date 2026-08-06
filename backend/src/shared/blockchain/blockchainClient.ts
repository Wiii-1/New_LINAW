import { ethers } from "ethers";
import { env } from "./../../config/env.js"

import auditTrailAbi from "./abi/auditTrail.json" with {
    type: "json"
};

const provider = new ethers.JsonRpcProvider(
    env.BLOCKCHAIN_RPC_URL
)

const wallet = new ethers.Wallet(
    env.BLOCKCHAIN_PRIVATE_KEY,
    provider
)

export const auditTrailContract = 
    new ethers.Contract(
        env.AUDIT_CONTRACT_ADDRESS,
        auditTrailAbi,
        wallet
    )
