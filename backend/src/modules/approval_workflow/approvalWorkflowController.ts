import { Request, Response, NextFunction, response } from "express";
import { ApprovalWorkflowService } from "./approvalWorkflowService.js"
import {    APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA, 
            APPROVAL_WORKFLOW_QUERY_SCHEMA, 
            REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA,
            ApprovalWorkflowIdParams,
            ApprovalWorkflowQuery,
            RejectApprovalWorkflowBody,
            APPROVAL_WORKFLOW_LEVEL_CREATION,
            APPROVAL_WORKFLOW_CREATION,
            CreateWorkflow
        } from "./approvalWorkflowValidator.js";
import { REPLCommand } from "node:repl";

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

            const data: ApprovalWorkflowIdParams = {
                ApprovalWorkflowId: params.ApprovalWorkflowId,
                userId: req.user.id
            }

            const approved = await this.service.approveRequest(data)

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
                approvalWorkflowId: params.ApprovalWorkflowId
            }

            const rejected = await this.service.rejectRequest(data)

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

            const data: ApprovalWorkflowIdParams = {
                ApprovalWorkflowId: params.ApprovalWorkflowId,
                userId: req.user.id
            }

            const cancelled = await this.service.cancelRequest(data)

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

            const data = {
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


    createLevels = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const body = APPROVAL_WORKFLOW_LEVEL_CREATION.parse(req.body)

            const data = {
                ...body,
                userId: req.user.id
            }

            const level = await this.service.createLevel(data)

            res.status(201).json({
                success: true,
                data: level
            })
        } catch (err) {
            next(err)   
        }
    }

    createWorkflowDefinition = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const body = APPROVAL_WORKFLOW_CREATION.parse(req.body)

            const data: CreateWorkflow = {
                ...body,
                userId: req.user.id
            }

            const workflow = await this.service.createWorkflowDefinition(data)

            res.status(201).json({
                success: true,
                data: workflow
            })
        } catch (err) {
            next(err)
        }
    }    

    workflowCodes = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {

        } catch (err) {
            next(err)
        }
    }

    workflowLevels = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {

        } catch (err) {
            next(err)
        }
    }
}