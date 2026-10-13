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

interface AcceptInvitationContext {
    user_id: string;
    tenant_id: string;
    company_id?: string;
    token: string;
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

    private invitationUrl (
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
        const tokenHash = await this.hashInvitationToken(token);
        const expiresAt = this.createInvitationExpiration();
        const url = this.invitationUrl(env, token);

        // Repository operation to prepare the invitation for sending.
        const prepared = await this.repository.prepareInvitationForSending({
            invitation_id: input.invitation_id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });

        if (!prepared) {
            throw new Error(
                "The invitation could not be prepared for sending."
            );
        }

        const provider = new MailgunEmailProvider(env);
        const emailService = new EmailService(provider);

        await emailService.send({
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

                    <p>This invitation expires in 72 hours.</p>

                    <p>
                        If you weren't expecting this invitation, you can safely ignore this email.
                    </p>

                    <p>Regards,<br />LINAW Team</p>
                </div>
            `,
        });

        // Repository operation to transition SENDING -> PENDING.
        const sent = await this.repository.markInvitationPending({
            invitation_id: input.invitation_id,
            tenant_id: input.tenant_id,
            company_id: input.company_id,
        });

        if (!sent) {
            throw new Error(
                "The email was submitted, but the invitation status could not be updated."
            );
        }

        return {
            invitation_id: input.invitation_id,
            status: "PENDING",
            expires_at: expiresAt,
        };
    }

    async validateInvitation(input: {
        token: string;
    }) {
        const tokenHash = await this.hashInvitationToken(input.token);

        const invitation =
            await this.repository.findInvitationByTokenHash({
                token_hash: tokenHash,
            });

        if (!invitation) {
            throw new Error("Invalid invitation.");
        }

        if (invitation.status !== "PENDING") {
            throw new Error("This invitation is no longer valid.");
        }

        if (
            !invitation.expires_at ||
            invitation.expires_at.getTime() <= Date.now()
        ) {
            throw new Error("This invitation has expired.");
        }

        return {
            valid: true,
            invitation: {
                id: invitation.id,
                email: invitation.email,
                expires_at: invitation.expires_at,
            },
        };
    }

    async acceptInvitation(input: AcceptInvitationContext) {
        const tokenHash = await this.hashInvitationToken(input.token);

        // Revalidate the invitation on the server.
        // The frontend's earlier validation is not sufficient.
        const invitation = await this.repository.findInvitationByTokenHash({
            token_hash: tokenHash,
        });

        if (!invitation) {
            throw new Error("Invalid invitation.");
        }

        if (invitation.status !== "PENDING") {
            throw new Error("This invitation is no longer valid.");
        }

        if (
            !invitation.expires_at ||
            invitation.expires_at.getTime() <= Date.now()
        ) {
            throw new Error("This invitation has expired.");
        }

        // Resolve the authenticated user and verify the invited email.
        const user = await this.repository.findAcceptingUser({
            user_id: input.user_id,
            tenant_id: input.tenant_id,
        });

        if (!user) {
            throw new Error("Authenticated user not found.");
        }

        const normalizedUserEmail = user.email.trim().toLowerCase();
        const normalizedInvitationEmail = invitation.email
            .trim()
            .toLowerCase();

        if (normalizedUserEmail !== normalizedInvitationEmail) {
            throw new Error(
                "The invitation email does not match your account email.",
            );
        }

        // Resolve the company the user is accepting on behalf of.
        const memberships =
            await this.repository.findActiveCompanyMemberships({
                user_id: input.user_id,
                tenant_id: input.tenant_id,
            });

        let acceptingCompanyId = input.company_id;

        if (!acceptingCompanyId && memberships.length === 1) {
            const membership = memberships[0];

            if (membership) {
                acceptingCompanyId = membership.company_id;
            }
        }

        if (memberships.length === 0) {
            throw new Error(
                "Register or join a company before accepting this invitation.",
            );
        }

        if (!acceptingCompanyId) {
            throw new Error(
                "Select the company that will accept this invitation.",
            );
        }

        const belongsToCompany = memberships.some(
            (membership) =>
                membership.company_id === acceptingCompanyId,
        );

        if (!belongsToCompany) {
            throw new Error(
                "You do not have an active membership in the selected company.",
            );
        }

        // The repository must perform the relationship changes and invitation
        // acceptance atomically, including a final status/expiry check.
        const acceptedAt = new Date();

        const result = await this.repository.acceptInvitation({
            invitation_id: invitation.id,
            token_hash: tokenHash,
            user_id: input.user_id,
            tenant_id: input.tenant_id,
            company_id: acceptingCompanyId,
            accepted_at: acceptedAt,
        });

        if (!result) {
            throw new Error(
                "The invitation could not be accepted. It may have expired or already been accepted.",
            );
        }

        return {
            invitation_id: invitation.id,
            relationship_id: result.relationship_id,
            status: "ACCEPTED" as const,
            accepted_at: result.accepted_at,
        };
    }
}