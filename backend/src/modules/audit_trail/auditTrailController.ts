import { Request, Response, NextFunction} from "express"
import { AuditTrailService } from "./auditTrailService.js"
import { searchAuditSchema, auditIntegritySchema} from "./auditTrailValidator.js"

export class auditTrailController {
    constructor(private readonly service: AuditTrailService){
        this.service = service
    }

    searchAuditRecord = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {

        const user_id = req.user.user_id

        const tenant_id = req.user.tenant_id

        const { audit_id } = searchAuditSchema.parse(req.params)

        const search = {
            user_id,
            tenant_id,
            audit_id
        }
        const id = await this.service.searchAudit(search)

        res.status(200).json({
            success: true,
            message: "Purchase Order Found",
            data:id
        })
        } 
        catch (err){
            next(err)
        }
    }   

    verifyAuditIntegrity = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try{
            const { audit_id} = auditIntegritySchema.parse(req.params.id)

            const user_id = req.user.user_id

            const tenant_id = req.user.tenant_id

            const verify = {
                user_id,
                tenant_id,
                audit_id
            }

            const data = await this.service.auditIntegrity(verify)

            res.status(200).json({
                success:true,
                data:data
            })
        }
        catch (err) {
            next(err)
        }
    }
}