import jwt from "jsonwebtoken"
import { env } from "./../../config/env.js"

interface TokenPayload {

    userID:string,
    role:string

}

export function generateAccessToken (
    payload:TokenPayload
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
    payload:TokenPayload
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