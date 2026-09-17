import type { AppContext } from "../../shared/types/hono.js"
import { Context } from "hono"
import { AuditTrailService } from "./auditTrailService.js"
import { searchAuditSchema, auditIntegritySchema} from "./auditTrailValidator.js"

export class auditTrailController {
    constructor(private readonly service: AuditTrailService){
        this.service = service
    }

    searchAuditRecord = async (
        c: Context<AppContext>
    ): Promise <void> => {


    const { user_id, tenant_id } = c.get("user")

    const { audit_id } = searchAuditSchema.parse(c.req.param())

    const search = {
        user_id,
        tenant_id,
        audit_id
    }
    const id = await this.service.searchAudit(c.env, search)

    c.json({
        success: true,
        message: "Purchase Order Found",
        data:id
    }, 200 )

    }   

    verifyAuditIntegrity = async (
        c: Context<AppContext>
    ) => {
        
        const { audit_id} = auditIntegritySchema.parse(c.req.param("id"))

        const { user_id, tenant_id } = c.get("user")

        const verify = {
            user_id,
            tenant_id,
            audit_id
        }

        const data = await this.service.auditIntegrity(c. env, verify)

        c.json({
            success:true,
            data:data
        }, 200)

    }
}