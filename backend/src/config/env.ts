import dotenv from "dotenv"
import type { SignOptions } from "jsonwebtoken"


dotenv.config({
    path:"/src/config/.env"
})

type JwtExpiresIn = SignOptions["expiresIn"]

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET

if (!jwtAccessSecret) {
    throw   new Error("JWT_ACCESS_SECRET is required")
}

if (!jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is required")
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
}