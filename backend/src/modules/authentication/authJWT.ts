import jwt from "jsonwebtoken"
import { env } from "./../../config/env.js"

interface AccessTokenPayload {
    user_id:string
}

interface RefreshTokenPayload {
    user_id:string,
    session_id:string
}

export function generateAccessToken (
    payload:AccessTokenPayload
) {

    return jwt.sign(
        payload,
        env.JWT_ACCESS_SECRET,
        {
            expiresIn:
            env.JWT_ACCESS_EXPIRES
        }
    );

}

export function generateRefreshToken(
    payload: RefreshTokenPayload        
){

    return jwt.sign(
        payload,
        env.JWT_REFRESH_SECRET,
        {
            expiresIn:
                env.JWT_REFRESH_EXPIRES
        }
    )
    
}

export function verifyRefreshToken (
    token:string
) {
    return jwt.verify(
        token,
        env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;
}