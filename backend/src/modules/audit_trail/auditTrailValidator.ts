import { z } from "zod"

// =========
// search audit schema
// =========

export const searchAuditSchema = z.object ({
    id: z
        .string()
})

// =========
// audit integrity schema
// =========

export const auditIntegritySchema = z.object({
    id: z
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
