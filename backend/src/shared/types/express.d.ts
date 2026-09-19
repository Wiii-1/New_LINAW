import type { AuthAccessTokenPayload } from "../modules/auth/authJwt.js";

declare global {
    namespace Express {
        interface Request {
            user?: AuthAccessTokenPayload;
        }
    }
}

export {};