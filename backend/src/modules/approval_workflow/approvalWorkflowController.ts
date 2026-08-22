import { Request, Response, NextFunction } from "express";
import { ApprovalWorkflowService } from "./approvalWorkflowService.js"
import {    APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA, 
            APPROVAL_WORKFLOW_QUERY_SCHEMA, 
            REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA,
            ApprovalWorkflowIdParams,
            ApprovalWorkflowQuery,
            RejectApprovalWorkflowBody
        } from "./approvalWorkflowValidator.js";

type ApprovalWorkflowActionInput = {
    requisitionId: string;
    userId: string;
};

export class ApprovalWorkflowController {
    constructor(private service: ApprovalWorkflowService) {
        this.service = service
    }

    approve = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(req.params)

            const data: ApprovalWorkflowActionInput = {
                requisitionId: params.requisitionId,
                userId: req.user.id
            }

            const approved = await this.service.approveRequisition(data)

            res.status(200).json({
                success: true,
                data: approved
            })            
        } catch (err) {
            next(err)
        }
    }

    reject = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(req.params)

            const body = REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA.parse(req.body)

            const data: RejectApprovalWorkflowBody = {
                remarks: body.remarks,
                userId: req.user.id,
                requisitionId: params.requisitionId
            }

            const rejected = await this.service.rejectRequisition(data)

            res.status(200).json({
                success: true,
                data: rejected
            })

        } catch (err) {
            next(err)
        }
    }

    cancel = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(req.params)

            const data: ApprovalWorkflowActionInput = {
                requisitionId: params.requisitionId,
                userId: req.user.id
            }

            const cancelled = await this.service.cancelRequisition(data)

            res.status(200).json({
                success: true,
                data: cancelled
            })

        } catch (err) {
            next(err)
        }
    }

    approvalWorkflow = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const query = APPROVAL_WORKFLOW_QUERY_SCHEMA.parse(req.query)

            const data: ApprovalWorkflowQuery = {
                status: query.status,
                userId: req.user.id
            }

            const getApprovalWorkflows = await this.service.getApprovalWorkflows(data)

            res.status(200).json({
                success: true,
                data: getApprovalWorkflows
            })

        } catch (err) {
            next(err)
        }
    }

    approvalRequest = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise <void> => {
        try {
            const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(req.params)

            const data: ApprovalWorkflowActionInput = {
                requisitionId: params.requisitionId,
                userId: req.user.id
            }

            const request = await this.service.approvalRequest(data)

            res.status(200).json({
                success: true,
                data: request
            })

        } catch (err) {
            next(err)
        }
    }
}