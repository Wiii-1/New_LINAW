import { Request, Response, NextFunction } from "express"
import { purchaseRequisitionService } from "./purchaseRequisitionService.js"
import { purchaseRequisitionIdParamsSchema, purchaseRequisitionInputSchema, cancelPurchaseRequisitionSchema, updatePurchaseRequisitionSchema, PurchaseRequisitionIdParams, PurchaseRequisitionInput, CancelPurchaseRequisitionInput, ResubmitPurchaseRequisitionInput, PurchaseRequisitionUpdate } from "./purchaseRequisitionValidation.js"
import { UnauthorizedAccessError } from "../../shared/errors/appError.js"

export class PurchaseRequisitionController {
    constructor(private service: purchaseRequisitionService ) {
        this.service = service
    }

    createRequisition = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try{
            if (!req.user) {
                throw new UnauthorizedAccessError("Authentication required");
            }        
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
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params =
                purchaseRequisitionIdParamsSchema.parse(req.params);

            const submitRequisition: PurchaseRequisitionIdParams = {
                requisitionId: params.requisitionId,
                userId: req.user.user_id
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
        req: Request,
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
        req: Request,
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
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params = purchaseRequisitionIdParamsSchema.parse(req.params)

            const data: PurchaseRequisitionIdParams = { 
                requisitionId: params.requisitionId,
                userId: req.user.id
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
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params = purchaseRequisitionIdParamsSchema.parse(req.params)

            const requisitionDetails: PurchaseRequisitionIdParams = {
                requisitionId: params.requisitionId,
                userId: req.user.id
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
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const updateContent = updatePurchaseRequisitionSchema.parse(req.body)

            const params = purchaseRequisitionIdParamsSchema.parse(req.params)

            const updateReqs = await this.service.updateRequisition(
                params.requisitionId,
                req.user.id,
                updateContent
            )

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