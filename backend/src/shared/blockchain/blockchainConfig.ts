import { env } from "../../config/env.js"

export const blockchainConfig = {
    rpcUrl: env.BLOCKCHAIN_RPC_URL,

    contractAddress: env.AUDIT_CONTRACT_ADDRESS,

    privateKey:  env.BLOCKCHAIN_PRIVATE_KEY,
}