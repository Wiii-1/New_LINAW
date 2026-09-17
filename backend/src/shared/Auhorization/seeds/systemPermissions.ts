export const systemPermissions = {
    auditTrail: {
        search:"audit_trail:search",
        verify: "audit_trail:verify"
    },
    purchaseRequisition: {
        create:"pr:create",
        cancel:"pr:cancel",
        submit:"pr:submit", // this permission will be used for submit and re-submit endpoint
        update:"pr:update",
        read:"pr:read"
    },
} as const

export type Permission = {
  [Resource in keyof typeof systemPermissions]: 
    (typeof systemPermissions)[Resource][keyof (typeof systemPermissions)[Resource]]
}[keyof typeof systemPermissions];

export const systemPermissionSeeds = [
    {
        code: "audit_trail:search",
        name: "Search Audit Trail",
        resource: "audit_trail",
        action: "search",
        description: "Allows searching the audit trail.",
    },
    {
        code: "audit_trail:verify",
        name: "Verify Audit Trail",
        resource: "audit_trail",
        action: "verify",
        description: "Allows verifying audit trail records.",
    },
    // ...
] as const;