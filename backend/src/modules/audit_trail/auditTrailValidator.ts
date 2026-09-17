import { z } from "zod"

// =========
// search audit schema
// =========

export const searchAuditSchema = z.object ({
    audit_id: z
        .string()
        .uuid(),
    user_id: z
        .string()
        .uuid(),
    tenant_id: z
        .string()
        .uuid()
})

// =========
// audit integrity schema
// =========

export const auditIntegritySchema = z.object({
    audit_id: z
        .string()
        .uuid(),
    user_id: z
        .string()
        .uuid(),
    tenant_id: z
        .string()
        .uuid()
})


// =========
// Interface
// =========


export type searchAudit = 
    z.infer<typeof searchAuditSchema>

export type auditIntegrity = 
    z.infer<typeof auditIntegritySchema>
