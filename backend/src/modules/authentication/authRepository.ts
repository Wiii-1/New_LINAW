import { prisma } from "../../config/database.js"

export class AuthRepository {

    async findUserWithCredentialsByEmail (
        email: string
    ) {
        return prisma.user.findFirst({
            where:{
                email: email
            },
            include:{
                credentials:true,
                tenant:true
            }
        })
    }

    async findActiveCompanyMemberships(input: {
        user_id: string;
        tenant_id: string;
    }) {
        return prisma.companyMembership.findMany({
            where: {
                user_id: input.user_id,
                tenant_id: input.tenant_id,
                employment_status: "ACTIVE",
            },
            select: {
                company_id: true,
            },
        });
    }

    async findUserWithCredentialsById (
        userId: string
    ) {
        return prisma.user.findUnique({
            where:{
                id: userId
            },
            include:{
                credentials:true,
                tenant:true
            }
        })
    }

    async findUserById (
        userId: string
    ){
        return prisma.user.findUnique({
            where:{
                id: userId
            }
        })
    }

    async registerUser(data: {
        tenant_id: string;
        first_name: string;
        last_name: string;
        email: string;
        password_hash: string;
    }) {
        return prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    id: data.tenant_id,
                    status: "ACTIVE",
                    plan: "FREE",
                },
            });

            const user = await tx.user.create({
                data: {
                    tenant_id: tenant.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    status: "ACTIVE",
                },
            });

            await tx.userCredential.create({
                data: {
                    user_id: user.id,
                    password_hash: data.password_hash,
                },
            });

            return user;
        });
    }

    async findSessionById (
        session_id: string
    ) {
        return prisma.userSession.findUnique ({
            where: {
                id: session_id
            }
        })
    }

    async createSession(data: {
        id: string;
        tenant_id: string;
        user_id: string;
        refresh_token_hash: string;
        expires_at: Date;
    }) {
        return prisma.userSession.create({
            data: {
                id: data.id,
                tenant_id: data.tenant_id,
                user_id: data.user_id,
                refresh_token_hash: data.refresh_token_hash,
                expires_at: data.expires_at,
            },
        });
    }

    async findSessionByTokenHash (
        refreshTokenHash: string
    ) {
        return prisma.userSession.findUnique({
            where: {
                refresh_token_hash: refreshTokenHash
            }
        })
    }

    async updateSessionToken(
        session_Id: string,
        refreshTokenHash: string
    ) {
        return prisma.userSession.update({
            where: {
                id: session_Id
            },
            data: {
                refresh_token_hash: refreshTokenHash
            }
        });
    }

    async rotateSessionToken(input: {
        session_id: string;
        current_refresh_token_hash: string;
        new_refresh_token_hash: string;
        now: Date;
    }) {
        return prisma.userSession.updateMany({
            where: {
                id: input.session_id,
                refresh_token_hash: input.current_refresh_token_hash,
                revoked_at: null,
                expires_at: {
                    gt: input.now,
                },
            },
            data: {
                refresh_token_hash: input.new_refresh_token_hash,
            },
        });
    }

    async revokeSessionIfCurrent(input: {
        session_id: string;
        current_refresh_token_hash: string;
        now: Date;
    }) {
        return prisma.userSession.updateMany({
            where: {
                id: input.session_id,
                refresh_token_hash: input.current_refresh_token_hash,
                revoked_at: null,
                expires_at: {
                    gt: input.now,
                },
            },
            data: {
                revoked_at: input.now,
            },
        });
    }

    async revokedSession (
        id: string
    ) {
        return prisma.userSession.update ({
            where: {
                id
            },

            data: {
                revoked_at: new Date()
            }
        })
    }

    async revokeAllSessionsForUser (
        userId: string,
        revokedAt: Date = new Date()
    ) {
        return prisma.userSession.updateMany({
            where: {
                user_id: userId,
                revoked_at: null
            },
            data: {
                revoked_at: revokedAt
            }
        })
    }

    async updateUserPassword (
        userId: string,
        passwordHash: string
    ) {
        return prisma.userCredential.update({
            where: {
                user_id: userId
            },
            data: {
                password_hash: passwordHash
            }
        })
    }

    async createPasswordResetToken (data: {
        id: string,
        tenant_id: string,
        user_id: string,
        token_hash: string,
        expires_at: Date
    }) {
        return prisma.passwordResetToken.create({
            data
        })
    }

    async findPasswordResetTokenById (id: string) {
        return prisma.passwordResetToken.findUnique({
            where: {
                id
            }
        })
    }

    async markPasswordResetTokenUsed (
        id: string,
        usedAt: Date
    ) {
        return prisma.passwordResetToken.update({
            where: {
                id
            },
            data: {
                used_at: usedAt
            }
        })
    }

    async markPasswordResetTokensForUserUsed (
        userId: string,
        usedAt: Date
    ) {
        return prisma.passwordResetToken.updateMany({
            where: {
                user_id: userId,
                used_at: null
            },
            data: {
                used_at: usedAt
            }
        })
    }

    async completePasswordReset(input: {
        token_id: string;
        user_id: string;
        password_hash: string;
        now: Date;
    }) {
        return prisma.$transaction(async (tx) => {
            // Atomically claim the reset token.
            // Only one concurrent request can consume an unused,
            // unexpired token successfully.
            const tokenResult = await tx.passwordResetToken.updateMany({
                where: {
                    id: input.token_id,
                    user_id: input.user_id,
                    used_at: null,
                    expires_at: {
                        gt: input.now,
                    },
                },
                data: {
                    used_at: input.now,
                },
            });

            if (tokenResult.count !== 1) {
                return false;
            }

            // Update the password within the same transaction.
            await tx.userCredential.update({
                where: {
                    user_id: input.user_id,
                },
                data: {
                    password_hash: input.password_hash,
                },
            });

            // Invalidate any other outstanding reset tokens.
            await tx.passwordResetToken.updateMany({
                where: {
                    user_id: input.user_id,
                    used_at: null,
                },
                data: {
                    used_at: input.now,
                },
            });

            // Revoke all active sessions for this user.
            await tx.userSession.updateMany({
                where: {
                    user_id: input.user_id,
                    revoked_at: null,
                },
                data: {
                    revoked_at: input.now,
                },
            });

            return true;
        });
    }

}

export async function getUserRole(
    userId: string,
    tenantId: string,
) {
    const userRole = await prisma.userRole.findFirst({
        where: {
            user_id: userId,
            role: {
                tenant_id: tenantId,
            },
        },
        include: {
            role: {
                include: {
                    role_permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        },
    });

    return userRole?.role ?? null;
}