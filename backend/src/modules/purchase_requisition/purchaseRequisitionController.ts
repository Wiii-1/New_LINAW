import { Response, NextFunction } from "express"
import { purchaseRequisitionService } from "./purchaseRequisitionService.js"
import { purchaseRequisitionIdParamsSchema, purchaseRequisitionInputSchema, cancelPurchaseRequisitionSchema , PurchaseRequisitionIdParams, PurchaseRequisitionInput, CancelPurchaseRequisitionInput, ResubmitPurchaseRequisitionInput } from "./purchaseRequisitionValidation.js"
import { AuthRequest } from "../../shared/middleware/authenticate.js"

export class PurchaseRequisitionController {
    constructor(private service: purchaseRequisitionService ) {
        this.service = service
    }

    createRequisition = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try{
            const requisition = purchaseRequisitionInputSchema.parse(req.body)

            const userId = req.user.id

            const tenantId = req.user.tenant_id

            const purchaseRequisition: PurchaseRequisitionInput = {
                ...requisition,
                userId,
                tenantId
            }

            const creation = await this.service.createRequisition(purchaseRequisition)

            res.status(201).json({
                success: true,
                message: "Purchase requisition created successfully.",
                data: creation
            })
        } catch (err){
            next(err)
        }
    }

    submitRequisition  = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params =
                purchaseRequisitionIdParamsSchema.parse(req.params);

            const submitRequisition: PurchaseRequisitionIdParams = {
                requisitionId: params.requisitionId,
                userId: req.user.id
            };

            const submit = await this.service.submitRequisition(submitRequisition)

            res.status(200).json({
                success: true,
                message: "Purchase requisition submitted successfully.",
                data: {
                    requisition_id: submit.requisition_id,
                    requisition_status: submit.requisition_status,
                    submitted_at: submit.submitted_at
                }
            })
        } catch (err){
            next(err)
        }
    }

    cancelRequisition = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const cancellation = cancelPurchaseRequisitionSchema.parse(req.body)

            const params = purchaseRequisitionIdParamsSchema.parse(req.params)

            const cancelRequisition: CancelPurchaseRequisitionInput = {
                ...cancellation,
                requisitionId: params.requisitionId,
                userId: req.user.id
            }

            const cancel = await this.service.cancelRequisition(cancelRequisition)

            res.status(200).json({
                success: true,
                message: "Purchase resquisition cancelled successfully.",
                data: cancel
            })

        } catch (err){
            next(err)
        }
    }
    
    resubmitRequisition = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {

            const params = purchaseRequisitionIdParamsSchema.parse(req.params)

            const retryRequisition = purchaseRequisitionInputSchema.parse(req.body)

            const resubmit: ResubmitPurchaseRequisitionInput = {
                ...retryRequisition,
                requisitionId: params.requisitionId,
                userId: req.user.id
            }

            const resubmitRequisition = await this.service.resubmitRequisition(resubmit)

            res.status(200).json({
                success: true,
                message: "Purchase requisition successfully submitted",
                data: {
                    requisition_id: resubmitRequisition.requisition_id,
                    requisition_status: resubmitRequisition.requisition_status,
                    submitted_at: resubmitRequisition.submitted_at
                }
            })

        } catch (err){
            next(err)
        }
    }

    requisition = async(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const requisitionId = purchaseRequisitionIdParamsSchema.parse(req.params.id)

            const userId = req.user.id

            const data = { 
                requisitionId,
                userId
            }

            const requisition = await this.service.getRequisition(data)

            res.status(200).json({
                success: true,
                data: requisition
            })

        } catch (err){
            next(err)
        }
    }

    details = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const requisition = purchaseRequisitionIdParamsSchema.parse(req.params.id)

            const userId = req.user.id

            const requisitionDetails = {
                requisition,
                userId
            }

            const details = await this.service.purchaseRequisitionDetail(requisitionDetails)

            res.status(200).json({
                success: true,
                data: details
            })

        } catch (err){
            next(err)
        }
    }

    update = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const requisitionId = purchaseRequisitionIdParamsSchema.parse(req.params.id)

            const userId = req.user.id

            const update = {
                requisitionId,
                userId
            }

            const updateReqs = await this.service.updateRequisition(update)

            res.status(200).json({
                success: true,
                message: "Purchase Requisition update",
                data: updateReqs
            })

        } catch (err){
            next(err)
        }
    }
}