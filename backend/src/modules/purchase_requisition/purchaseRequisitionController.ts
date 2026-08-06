import { Request, Response, NextFunction } from "express"
import { PurchaseRequisitionService } from "./purchaseRequistionService.js"
import {  createPurchaseRequisitionSchema, purchaseRequisitionIdParamsSchema, purchaseRequisitionLineItemSchema } from "./purchaseRequisitionValidation.js"

// schemma don't forgettt


export class PurchaseRequisitionController {
    constructor(private service: PurchaseRequisitionService ) {
        this.service = service
    }

    createRequisition = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try{
            const requisition = createPurchaseRequisitionSchema.parse(req.body)

            const creation = await this.service.createRequisition(requisition)

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
            const {requisitionId} = purchaseRequisitionIdParamsSchema.parse(req.params)

            const submit = await this.service.submitRequisition(requisitionId)

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
            const {}
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
            
        } catch (err){
            next(err)
        }
    }

    updateStatus = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            
        } catch (err){
            next(err)
        }
    }

}