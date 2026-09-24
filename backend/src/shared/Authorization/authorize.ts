import type { Context, Next } from "hono" 

import type { Permission } from "./seeds/systemPermissions.js";
import type { AppContext } from "../types/hono.js";
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
        c: Context<AppContext>,
        next: Next
    ): Promise<void> => {
        
        const user = c.get("user")

        const role = await getUserRole(user.user_id, user.tenant_id);

        if (!role) {
            c.json({
                message: "Forbidden"
            }, 403 )

            return;
        }

        if (!hasPermission(role, permission)) {
            c.json({
                message: "Forbidden"
            }, 403)

            return;
        }

        next()
    }
}