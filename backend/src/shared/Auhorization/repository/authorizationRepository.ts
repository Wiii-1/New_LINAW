import { prisma } from "../../../config/database.js";

export async function upsertSystemPermission(permission: {
    code: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
}) {
    return prisma.permission.upsert({
        where: {
            code: permission.code,
        },
        update: {
            name: permission.name,
            resource: permission.resource,
            action: permission.action,
            description: permission.description ?? null,
        },
        create: permission,
    });
}

export async function upsertSystemRole(
    tenantId: string,
    role: {
        code: string;
        name: string;
        description?: string;
    },
) {
    return prisma.role.upsert({
        where: {
            tenant_id_code: {
                tenant_id: tenantId,
                code: role.code,
            },
        },
        update: {
            name: role.name,
            description: role.description ?? null,
        },
        create: {
            tenant_id: tenantId,
            code: role.code,
            name: role.name,
            description: role.description ?? null,
            is_system: true,
        },
    });
}

export async function upsertRolePermission(
    roleId: string,
    permissionId: string,
) {
    return prisma.rolePermission.upsert({
        where: {
            role_id_permission_id: {
                role_id: roleId,
                permission_id: permissionId,
            },
        },
        update: {},
        create: {
            role_id: roleId,
            permission_id: permissionId,
        },
    });
}