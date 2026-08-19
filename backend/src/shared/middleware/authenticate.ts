import jwt from "jsonwebtoken"
import { env } from "./../../config/env.js"
import { UnauthorizedAccessError } from "../errors/appError.js"
import type { AuthAccessTokenPayload } from "./../../modules/authentication/authJWT.js"

import type {
    Request,
    Response,
    NextFunction,
} from "express";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const header = req.headers.authorization;

    if (!header) {
        throw new UnauthorizedAccessError("Missing Token");
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new UnauthorizedAccessError("Invalid Authorization Header");
    }

    try {
        const decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET,
        ) as AuthAccessTokenPayload;

        req.user = decoded;

        next();
    } catch {
        throw new UnauthorizedAccessError("Invalid Token");
    }
}