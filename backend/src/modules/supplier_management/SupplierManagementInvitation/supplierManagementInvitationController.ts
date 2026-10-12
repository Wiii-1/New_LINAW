import type { AppContext } from "../../../shared/types/hono.js";
import type { Context } from "hono";

import {
    CreateSupplierInvitationSchema,
    InvitationIdSchema,
    InvitationTokenSchema
} from "./supplierManagementInvitationValidator.js";
import type { SupplierManagementInvitationService } from "./supplierManagementInvitationService.js";
import { NotFoundError } from "../../../shared/errors/appError.js";

export class SupplierManagementInvitationController {

    constructor (
        private service: SupplierManagementInvitationService
    ){}

    // Create Supplier Invitation
    createInvitation = async (
        c: Context<AppContext>
    ) => {

        const { user_id, tenant_id, company_id } = c.get("user");

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const { email } = CreateSupplierInvitationSchema.parse(
            await c.req.json()
        );

        const invitation = {
            user_id,
            tenant_id,
            company_id,
            email
        };

        const Invitation = await this.service.createInvitation(invitation)

        return c.json({
            success: true,
            message: "Supplier invitation created successfully.",
            data: Invitation
        }, 201);
    };

    getInvitations = async (
        c: Context<AppContext>
    ) => {
        const { user_id, tenant_id, company_id } = c.var.user

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        } 
        
        const input = {
            user_id,
            tenant_id,
            company_id
        }

        const Invitations = await this.service.getInvitations(input)

        return c.json({
            success: true,
            message: "Invitations retrieved",
            data: Invitations
        })
    }

    // Get Supplier Invitation
    getInvitation = async (
        c: Context<AppContext>
    ) => {

        const { user_id, tenant_id, company_id } = c.get("user");

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const { invitationId } = InvitationIdSchema.parse({
            invitationId: c.req.param("invitationId")
        });

        const invitation = {
            user_id,
            tenant_id,
            company_id,
            invitation_id: invitationId
        };

        // TODO: Pass invitation to the service.

        return c.json({
            success: true,
            message: "Supplier invitation retrieved successfully.",
            data: invitation
        }, 200);
    };

    // Mailgun Supplier Invitation
    MailgunInvitation = async (
        c: Context<AppContext>
    ) => {

        const { user_id, tenant_id, company_id } = c.get("user");

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        } 

        const { invitationId } = InvitationIdSchema.parse({
            invitationId: c.req.param("invitationId")
        });

        const invitation = {
            user_id,
            tenant_id,
            company_id,
            invitation_id: invitationId
        };

        // TODO: Pass invitation to the service.
        // The service should handle token rotation and email delivery.

        const invitationSent = await this.service.sendInvitation(
            invitation,
            c.env
        )

        return c.json({
            success: true,
            message: "Supplier invitation resend requested.",
            data: invitationSent
        }, 200);
    };

    // Validate Supplier Invitation Token
    validateInvitation = async (
        c: Context<AppContext>
    ) => {

        const { token } = InvitationTokenSchema.parse({
            token: c.req.param("token")
        });

        // TODO: Pass token to the service for validation.
        // The service should hash the token and compare it with token_hash.

        
        return c.json({
            success: true,
            message: "Supplier invitation token received for validation.",
            data: {
                token_received: Boolean(token)
            }
        }, 200);
    };

    // Accept Supplier Invitation
    acceptInvitation = async (
        c: Context<AppContext>
    ) => {

        const { user_id, tenant_id, company_id } = c.get("user");

        if (!company_id) {
            throw new NotFoundError("User does not belong to a company")
        }         

        const { invitationId } = InvitationIdSchema.parse({
            invitationId: c.req.param("invitationId")
        });

        const invitation = {
            user_id,
            tenant_id,
            company_id,
            invitation_id: invitationId
        };

        // TODO: Pass invitation to the service.
        // The service should verify eligibility and perform acceptance.

        return c.json({
            success: true,
            message: "Supplier invitation acceptance requested.",
            data: invitation
        }, 200);
    };
}