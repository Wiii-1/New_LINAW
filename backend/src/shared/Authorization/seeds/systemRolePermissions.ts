export const systemRolePermissions = {
    ORGANIZATION_ADMIN: [
        "pr:create",
        "pr:cancel",
        "pr:submit",
        "pr:update",
        "pr:read",
        "audit_trail:search",
        "audit_trail:verify",
    ],

    PURCHASING_OFFICER: [
        "pr:create",
        "pr:update",
        "pr:submit",
        "pr:read",
    ],

    AUDITOR: [
        "audit_trail:search",
        "audit_trail:verify",
    ],
} as const;