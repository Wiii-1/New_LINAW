import type { Permission } from "./seeds/systemPermissions.js";
import { Request, Response, NextFunction } from "express";
import { getUserRole } from "../../modules/authentication/authRepository.js";

export function hasPermission(
    role: Awaited<ReturnType<typeof getUserRole>>,
    permission: Permission,
): boolean {
    if (!role) {
        return false;
    }

    return role.role_permissions.some(
        (rolePermission) =>
            rolePermission.permission.code === permission
    );
}

export function Authorize(permission: Permission) {
    
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        
        const user = req.user

        const role = await getUserRole(user.id, user.tenantId);

        if (!role) {
            res.status(403).json({
                message: "Forbidden",
            });

            return;
        }

        if (!hasPermission(role, permission)) {
            res.status(403).json({
                message: "Forbidden",
            });

            return;
        }

        next()
    }
}