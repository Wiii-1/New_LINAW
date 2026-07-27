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
                credentials:true
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
        email: string
    }){
        return prisma.user.create ({
            data
        })
    }

    async createTenant (data:{
        tenant_id: string,
        status: string,
        plan: string,
    }) {
        return prisma.createTenant.create({
            data
        })
    }

    async createUserCredentials (data: {
        user_id: string,
        password_hash: string
    }) {
        return prisma.createUserCredentials.create({
            data
        })
    }

    async findSessionById (
        session_id: string
    ) { 
        return prisma.user_session.findUnique ({
            where: {
                session_id
            }
        })
    }

    async createSession (data: {
        user_id: string,
        refreshTokenHash: string,
        expiresAt: Date,
    }) {
        return prisma.user_session.create({
            data
        });
    }

    async findSessionByTokenHash (
        refreshTokenHash: string
    ) {
        return prisma.user_session.findUnique({
            where: {
                refreshTokenHash
            }
        })
    }
    
    async updateSessionToken(
        session_Id: string,
        refreshTokenHash: string
    ) {
        return prisma.user_session.update({
            where: {
                id: session_Id
            },
            data: {
                refreshTokenHash
            }
        });
    }

    async revokedSession (
        id: string
    ) {
        return prisma.user_session.update ({
            where: {
                id
            },

            data: {
                revoked: new Date()
            }
        })
    }
}