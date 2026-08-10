import dotenv from "dotenv"
import type { SignOptions } from "jsonwebtoken"

dotenv.config();

type JwtExpiresIn = SignOptions["expiresIn"]

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET

const blockchainRpcUrl = process.env.BLOCKCHAIN_RPC_URL
const auditContractAddress = process.env.AUDIT_CONTRACT_ADDRESS
const blockchainPrivateKey = process.env.BLOCKCHAIN_PRIVATE_KEY
const appUrl = process.env.FRONTEND_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000"


if (!jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is required")
}

if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is required")
}

if (!blockchainRpcUrl) {
    throw new Error("BLOCKCHAIN_RPC_URL is required")
}

if (!auditContractAddress) {
    throw new Error("AUDIT_CONTRACT_ADDRESS is required")
}

if (!blockchainPrivateKey) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY is required")
}


const jwtAccessExpires: JwtExpiresIn =
    (process.env.JWT_ACCESS_EXPIRES as JwtExpiresIn) ?? "60m"


const jwtRefreshExpires: JwtExpiresIn =
    (process.env.JWT_REFRESH_EXPIRES as JwtExpiresIn) ?? "7d"


export const env = {

    PORT: process.env.PORT || 5000,

    JWT_ACCESS_SECRET: jwtAccessSecret,

    JWT_REFRESH_SECRET: jwtRefreshSecret,

    JWT_ACCESS_EXPIRES: jwtAccessExpires,

    JWT_REFRESH_EXPIRES: jwtRefreshExpires,


    BLOCKCHAIN_RPC_URL: blockchainRpcUrl,

    AUDIT_CONTRACT_ADDRESS: auditContractAddress,

    BLOCKCHAIN_PRIVATE_KEY: blockchainPrivateKey,

    APP_URL: appUrl,

}