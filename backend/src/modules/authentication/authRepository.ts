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

    async createUser ( data: {
        tenant_id: string,
        first_name: string,
        last_name: string,
        job_title: string,
        email: string,
        status: string
    }){
        return prisma.user.create ({
            data: {
                tenant_id: data.tenant_id,
                first_name: data.first_name,
                last_name: data.last_name,
                job_title: data.job_title,
                email: data.email,
                status: data.status
            }
        })
    }

    async createTenant (data:{
        tenant_id: string,
        status: string,
        plan: string,
    }) {
        return prisma.tenant.create({
            data: {
                id: data.tenant_id,
                status: data.status,
                plan: data.plan
            }
        })
    }

    async createUserCredentials (data: {
        user_id: string,
        password_hash: string
    }) {
        return prisma.userCredential.create({
            data: {
                user_id: data.user_id,
                password_hash: data.password_hash
            }
        })
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

    async createSession (data: {
        tenant_id: string,
        user_id: string,
        refresh_token_hash: string,
        expires_at: Date,
    }) {
        return prisma.userSession.create({
            data: {
                tenant_id: data.tenant_id,
                user_id: data.user_id,
                refresh_token_hash: data.refresh_token_hash,
                expires_at: data.expires_at
            }
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