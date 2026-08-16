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

        const data = searchAuditSchema.parse(req.params.id)

        const id = await this.service.searchAudit(data)

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
            const id = auditIntegritySchema.parse(req.params.id)

            const data = await this.service.auditIntegrity(id)

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