import { sign, verify } from "hono/jwt"
import type { AppEnv } from "../../config/env.js"


export interface AccessTokenPayload {
    user_id:string,
    session_id:string,
    tenant_id:string
}

export interface RefreshTokenPayload {
    user_id:string,
    session_id:string
}

let jwtEnv: AppEnv

export function initializeJWT (env: AppEnv): void {
    jwtEnv = env
}


export async function generateAccessToken (
    payload:AccessTokenPayload,
): Promise<string> {
    if (!jwtEnv) {
        throw new Error("JWT has not been initialized");
    }

    return await sign(
        {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000)
                + parseExpiration(jwtEnv.JWT_ACCESS_EXPIRES),
        },
        jwtEnv.JWT_ACCESS_SECRET,
        "HS256",
    );
}

export async function generateRefreshToken(
    payload: RefreshTokenPayload      
): Promise<string> {
    if (!jwtEnv) {
        throw new Error("JWT has not been initialized");
    }

    return await sign(
        {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000)
                + parseExpiration(jwtEnv.JWT_REFRESH_EXPIRES),
        },
        jwtEnv.JWT_REFRESH_SECRET,
        "HS256",
    );
}

export async function verifyRefreshToken(
    token: string,
): Promise<RefreshTokenPayload> {
    if (!jwtEnv) {
        throw new Error("JWT has not been initialized");
    }

    const payload = await verify(
        token,
        jwtEnv.JWT_REFRESH_SECRET,
        "HS256"
    )

    if (
        typeof payload["user_id"] !== "string" ||
        typeof payload["session_id"] !== "string"
    ) {
        throw new Error("Invalid refresh token payload")
    }

    return {
        user_id: payload["user_id"],
        session_id: payload["session_id"]
    }
}

function parseExpiration (
    expiresIn: string | undefined,
): number {
    if (!expiresIn) {
        return 60 * 60 
    }

    const match = expiresIn.match(
        /^(\d+)(s|m|h|d)$/,
    )

    if (!match) {
        throw new Error (
            `Invalid JWT expiration format: ${expiresIn}`,
        )
    }

    const value = Number(match[1])
    const unit = match[2]

    switch (unit) {
        case "s":
            return value;

        case "m":
            return value * 60;

        case "h":
            return value * 60 * 60;

        case "d":
            return value * 60 * 60 * 24;

        default:
            throw new Error(
                `Unsupported JWT expiration unit: ${unit}`,
            );        
    }
}
