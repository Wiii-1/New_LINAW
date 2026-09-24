import type { AppContext } from "../../shared/types/hono.js";
import { Context } from "hono"
import { ApprovalWorkflowService } from "./approvalWorkflowService.js"
import {    APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA,  
            REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA, 
            APPROVAL_WORKFLOW_LEVEL_CREATION,
            APPROVAL_WORKFLOW_CREATION,
        } from "./approvalWorkflowValidator.js";

import type { CreateWorkflow, RejectApprovalWorkflowBody, ApprovalWorkflowIdParams } from "./approvalWorkflowValidator.js"

export class ApprovalWorkflowController {
    constructor(private service: ApprovalWorkflowService) {}

    approve = async (
        c: Context<AppContext>
    ): Promise <void> => {

        const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(c.req.param("id"))

        const data: ApprovalWorkflowIdParams = {
            ApprovalWorkflowId: params.ApprovalWorkflowId,
            userId: c.get("user").user_id
        }

        const approved = await this.service.approveRequest(data)

        c.json({
            success: true,
            data: approved
        }, 200)            

    }

    reject = async (
        c: Context<AppContext>
    ): Promise <void> => {

        const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(c.req.param("id"))

        const body = REJECT_APPROVAL_WORKFLOW_BODY_SCHEMA.parse(await c.req.json())

        const data: RejectApprovalWorkflowBody = {
            remarks: body.remarks,
            userId: c.get("user").user_id,
            approvalWorkflowId: params.ApprovalWorkflowId
        }

        const rejected = await this.service.rejectRequest(data)

        c.json({
            success: true,
            data: rejected
        },200)
    }

    cancel = async (
        c: Context<AppContext>
    ): Promise <void> => {

        const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(c.req.param)

        const data: ApprovalWorkflowIdParams = {
            ApprovalWorkflowId: params.ApprovalWorkflowId,
            userId: c.get("user").user_id
        }

        const cancelled = await this.service.cancelRequest(data)

        c.json({
            success: true,
            data: cancelled
        },200)

    }

    approvalWorkflow = async (
        c: Context<AppContext>
    ) => {

        const data = {
            userId: c.get("user").user_id
        }

        const getApprovalWorkflows = await this.service.getApprovalWorkflows(data)

        c.json({
            success: true,
            data: getApprovalWorkflows
        }, 200)

    }

    approvalRequest = async (
        c: Context<AppContext>
    ): Promise <void> => {

        const params = APPROVAL_WORKFLOW_ID_PARAMS_SCHEMA.parse(c.req.param("id"))

        const data = {
            userId: c.get("user").user_id,
            approvalWorkflowId: params.ApprovalWorkflowId
        }

        const request = await this.service.approvalRequest(data)

        c.json({
            success: true,
            data: request
        }, 200)

    }


    createLevels = async (
        c: Context<AppContext>
    ): Promise<void> => {

        const body = APPROVAL_WORKFLOW_LEVEL_CREATION.parse(c.req.json())

        const data = {
            ...body,
            userId: c.get("user").user_id
        }

        const level = await this.service.createLevel(data)

        c.json({
            success: true,
            data: level
        }, 200)

    }

    createWorkflowDefinition = async (
        c: Context<AppContext>
    ): Promise<void> => {
    
        const body = APPROVAL_WORKFLOW_CREATION.parse(await c.req.json())

        const data: CreateWorkflow = {
            ...body,
            userId: c.get("user").user_id
        }

        const workflow = await this.service.createWorkflowDefinition(data)

        c.json({
            success: true,
            data: workflow
        },200 )

    }    

    workflowCodes = async (
        c: Context<AppContext>
    ): Promise<void> => {
        const data = {
            userId: c.get("user").user_id
        }

        const getCodes = await this.service.workflowCodes(data)

        c.json({
            success: true,
            getCodes
        },200)
    }
}