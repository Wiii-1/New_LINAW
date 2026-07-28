import { Request, Response, NextFunction} from "express"
import { auditTrailService } from "./auditTrailService.js"
import { searchAuditSchema, auditIntegritySchema} from "./auditTrailValidator.js"

export class auditTrailController {
    constructor(private service: auditTrailService){
        this.service = service
    }

    searchAuditRecord = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {

        const id = searchAuditSchema.parse(req.params.id)

        const data = await this.service.searchAudit(id)

        res.status(200).json({
            success: true,
            message: "Purchase Order Found",
            data:data
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