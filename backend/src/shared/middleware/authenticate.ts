import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { env } from "./../../config/env.js"
import { UnauthorizedAccessError } from "../errors/appError.js"

export interface AuthRequest extends Request {
    user?:any
}

export function authenticate (
    req:AuthRequest,
    res:Response,
    next:NextFunction
) {
    const header = req.headers.authorization

    if (!header) {
        throw new UnauthorizedAccessError("Missing Token")
    }

    const token = header.split(" ")[1]

    if (!token) {
        throw new UnauthorizedAccessError("Missing Token")
    }

    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
        req.user = decoded
        next()
    } catch {
        throw new UnauthorizedAccessError("Invalid Token")
    }
}