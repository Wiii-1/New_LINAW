import type { AppContext } from "../../shared/types/hono.js"
import { Context } from "hono" 
import { purchaseRequisitionService } from "./purchaseRequisitionService.js"
import { 
    purchaseRequisitionIdParamsSchema, 
    purchaseRequisitionInputSchema, 
    cancelPurchaseRequisitionSchema, 
    updatePurchaseRequisitionSchema, 
    PurchaseRequisitionIdParams, 
    PurchaseRequisitionInput, 
    CancelPurchaseRequisitionInput, 
    ResubmitPurchaseRequisitionInput, 
    PurchaseRequisitionUpdate,
    PurchaseRequisitionQuery,
    PurchaseRequisitionQuerySchema
} from "./purchaseRequisitionValidation.js"
import { UnauthorizedAccessError } from "../../shared/errors/appError.js"

export class PurchaseRequisitionController {
    constructor(private service: purchaseRequisitionService ) {
        this.service = service
    }

    createRequisition = async (
        c: Context<AppContext>
    )   => {

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
  
    }

    submitRequisition  = async (
 
    ) => {
          
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
  
    }

    cancelRequisition = async (
 
    )   => {
          
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

  
    }
    
    resubmitRequisition = async (
 
    )   => {
          

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

  
    }

    requisition = async (
 
    ): Promise<void> => {
          
            const query = PurchaseRequisitionQuerySchema.parse(req.query);

            const data: PurchaseRequisitionQuery = {
                userId: req.user.id,
                tenantId: req.user.tenant_id,
                status: query.status,
                requesterId: query.requesterId,
                pr_number: query.pr_number,
            };

            const requisition = await this.service.getRequisition(data);

            res.status(200).json({
                success: true,
                data: requisition
            });

        } catch (err) {
            next(err);
        }
    }

    details = async (
 
    )   => {
          
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

  
    }

    update = async (
 
    )   => {
          
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

  
    }
}