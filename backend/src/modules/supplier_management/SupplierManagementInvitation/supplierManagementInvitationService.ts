import type { AppEnv } from "../../../config/env";
import type { Email } from "./supplierManagementInvitationValidator";
import { SupplierManagementInvitationRepository } from "./supplierManagementInvitationRepository"
import { EmailService } from "../../../shared/email/email.service";
import { MailgunEmailProvider } from "../../../shared/email/mailgun.provider";

interface CreateInvitationContext {
    user_id: string;
    tenant_id: string;
    company_id: string;
    email: Email;
}

interface GeneralContext {
    user_id: string;
    tenant_id: string;
    company_id: string;
}

interface InvitationContext {
    user_id: string;
    tenant_id: string;
    company_id: string;
    invitation_id: string;
}


export class SupplierManagementInvitationService {
    constructor(
        private repository: SupplierManagementInvitationRepository,
    ){}

    private  generateInvitationToken (): string {
        const randomBytes = crypto.getRandomValues(
            new Uint8Array(32)
        )

        return Array.from(randomBytes, byte => 
            byte.toString(16).padStart(2, "0")
        ).join("")
    }

    private async invitationUrl (
        env: AppEnv,
        token: string
    ) {
        const invitationUrl = new URL(
            "/invitations/accept",
            env.ALLOWED_ORIGIN
        )

        invitationUrl.searchParams.set("token", token)

        return invitationUrl.toString()
    }

    private async hashInvitationToken (
        token: string
    ): Promise<string> {
        const encodedToken = new TextEncoder().encode(token)

        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            encodedToken
        )

        return Array.from(new Uint8Array(hashBuffer), byte =>
            byte.toString(16).padStart(2, "0")
        ).join("")
    }

    private readonly INVITATION_LIFETIME_MS =
        72 * 60 * 60 * 1000

    private createInvitationExpiration(): Date {
        return new Date(
            Date.now() + this.INVITATION_LIFETIME_MS
        )
    }

    async createInvitation (input: CreateInvitationContext) {
        const invitation = await this.repository.createInvitation({
            user_id: input.user_id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            email: input.email
        })

        return invitation;
    }

    async getInvitations (input: GeneralContext) {
        return await this.repository.getInvitations({
            user_id: input.user_id,
            tenant_id: input.tenant_id,
            company_id: input.company_id
        })
    }

    async getInvitation (input: InvitationContext) {
        return await this.repository.getInvitation({
            user_id: input.user_id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            invitation_id: input.invitation_id
        })
    }


    async sendInvitation(
        input: InvitationContext,
        env: AppEnv
    ) {
        const invitation = await this.repository.getInvitation({
            user_id: input.user_id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            invitation_id: input.invitation_id,
        });

        if (!invitation) {
            throw new Error("Invitation not found.");
        }

        if (invitation.status !== "DRAFT") {
            throw new Error("Only draft invitations can be sent.");
        }

        const token = this.generateInvitationToken();

        const url = this.invitationUrl(env, token);

        const token_hash = await this.hashInvitationToken(token);

        const expiration = this.createInvitationExpiration();

        const provider = new MailgunEmailProvider(env);
        const emailService = new EmailService(provider);

        await emailService.send ({
            to: invitation.email,
            subject: "You're Invited to Join LINAW as a Supplier",
            text: [
                "Hello,",
                "",
                "You have been invited to join LINAW as a supplier.",
                "",
                "To review and accept this invitation, open the link below:",
                url,
                "",
                "This invitation expires in 72 hours.",
                "",
                "If you weren't expecting this invitation, you can safely ignore this email.",
                "",
                "Regards,",
                "LINAW Team",
            ].join("\n"),
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
                    <h2>You're Invited to Join LINAW</h2>

                    <p>Hello,</p>

                    <p>
                        You have been invited to join LINAW as a supplier.
                        Click the button below to review and accept your invitation.
                    </p>

                    <p style="margin: 32px 0;">
                        <a
                            href="${url}"
                            style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;"
                        >
                            Review Invitation
                        </a>
                    </p>

                    <p>
                        This invitation expires in 72 hours.
                    </p>

                    <p>
                        If you weren't expecting this invitation, you can safely ignore this email.
                    </p>

                    <p>Regards,<br />LINAW Team</p>
                </div>
            `,
        });

        


    }


    async validateInvitation () {}

    async acceptInvitation () {}

    
}