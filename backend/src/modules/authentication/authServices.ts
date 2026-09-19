import { AuthRepository  } from "./authRepository.js";
import { hashPassword, verifyPassword } from "./authPassword.js"
import { forgotPasswordInput, loginInput, resetPasswordInput, signupInput, findById } from "./authValidator.js";
import { ConflictError, NotFoundError, UnauthorizedAccessError } from "../../shared/errors/appError.js";
import { randomBytes, randomUUID } from "node:crypto";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./authJWT.js";
import type { AppEnv } from "../../config/env.js";
import { AuthNotifier, NoopAuthNotifier } from "./authNotifications.js";

export class AuthService {

    constructor (
        private repository: AuthRepository,
        private env: AppEnv,
        private notifier: AuthNotifier = new NoopAuthNotifier()
    ) {}
    
    async register (data: signupInput){

        console.log("SIGNUP: calling service");

        const {
            first_name,
            last_name,
            job_title,
            email,
            password
        } = data

        const existingEmail = await this.repository.findUserWithCredentialsByEmail(data.email)

        if(existingEmail) {
            throw new ConflictError("This email address is already registered.") 
        }

        const password_hash = await hashPassword(data.password)
        
        const tenantId = randomUUID()

        const tenant = await this.repository.createTenant({
            tenant_id:tenantId,
            status: "ACTIVE",
            plan: "FREE"
        })

        const user = await this.repository.createUser({
            tenant_id: tenant.id,
            first_name: data.first_name,
            last_name: data.last_name,
            job_title: data.job_title,
            email: data.email,
            status: "ACTIVE"
        })
        
        await this.repository.createUserCredentials({
            user_id: user.id,
            password_hash
        })

        console.log("SIGNUP: service returned");
        
        return user;
    }

    async login (data: loginInput) {

        console.log("LOGIN: calling service");

        const expiresAt = new Date()

        expiresAt.setDate(
            expiresAt.getDate() + 30
        )

        const {
            email,
            password
        } = data

        const user = await this.repository.findUserWithCredentialsByEmail(email)

        if(!user) {
            throw new NotFoundError ("Invalid email or password")
        }

        const isValid = await verifyPassword(
            user.credentials!.password_hash,
            data.password
        )

        if (!isValid){
            throw new UnauthorizedAccessError("Wrong Password")
        }

        const session = 
            await this.repository.createSession({
                tenant_id: user.tenant_id,
                user_id: user.id,
                refresh_token_hash: " ",
                expires_at: expiresAt
            })

        const refreshToken = await generateRefreshToken({
            user_id: user.id,
            session_id: session.id
        })

        const refreshTokenHash = await hashPassword(refreshToken)

        await this.repository.updateSessionToken(
            session.id,
            refreshTokenHash
        )

        const accessToken = await generateAccessToken({
            user_id: user.id,
            session_id: session.id,
            tenant_id: user.tenant_id
        })

        console.log(": service returned");

        return {
            accessToken,
            refreshToken
        }
    }

    async findId(user: findById) {

        const {
            id
        } = user

        const checkUser = await this.repository.findUserById(id)

        if (!checkUser) {
            throw new NotFoundError("User not found")
        }

        return {
            checkUser
        }
    }

    async logout(refreshToken: string) {

        const payload = await verifyRefreshToken(refreshToken)

        const session = await this.repository.findSessionById(payload.session_id)

        if (!session) {
            throw new NotFoundError("Session not found")
        }

        await this.repository.revokedSession(session.id)

        return {
            revoked: true
        }
    }

    async refresh(refreshToken: string) {

        const payload = await verifyRefreshToken(refreshToken)

        const session = await this.repository.findSessionById(
            payload.session_id
        )

        if (!session) {
            throw new UnauthorizedAccessError(
                "Session does not exist"
            )
        }

        const user = await this.repository.findUserById(
            session.user_id
        )

        if (!user) {
            throw new UnauthorizedAccessError(
                "User does not exist"
            )
        }

        if (session.revoked_at) {
            throw new UnauthorizedAccessError(
                "Session has been revoked"
            )
        }

        if (session.expires_at < new Date()) {
            throw new UnauthorizedAccessError(
                "Session expired"
            )
        }

        const isValid = await verifyPassword(session.refresh_token_hash, refreshToken)

        if (!isValid) {
            throw new UnauthorizedAccessError(
                "Invalid refresh token"
            )
        }

        const newAccessToken = generateAccessToken({
            user_id: user.id,
            session_id: session.id,
            tenant_id: user.tenant_id
        })

        const newRefreshToken = await generateRefreshToken({
            user_id: user.id,
            session_id: session.id
        })

        const newRefreshTokenHash = await hashPassword(
            newRefreshToken
        )

        await this.repository.updateSessionToken(
            session.id,
            newRefreshTokenHash
        )

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    }

    async requestPasswordReset(
            data: forgotPasswordInput
        ) {
        const user = await this.repository.findUserWithCredentialsByEmail(data.email)

        if (!user) {
            return {
                success: true
            }
        }

        const tokenId = randomUUID()
        const tokenSecret = randomBytes(32).toString("base64url")
        const resetToken = `${tokenId}.${tokenSecret}`
        const tokenHash = await hashPassword(tokenSecret)

        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)

        await this.repository.createPasswordResetToken({
            id: tokenId,
            tenant_id: user.tenant_id,
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: expiresAt
        })

        const resetUrl = new URL("/reset-password", this.env.APP_URL)
        resetUrl.searchParams.set("token", resetToken)

        await this.notifier.sendPasswordResetEmail({
            email: user.email,
            resetLink: resetUrl.toString()
        })

        return {
            success: true
        }
    }

    async resetPassword(data: resetPasswordInput) {
        const [tokenId, tokenSecret] = data.resetToken.split(".")

        if (!tokenId || !tokenSecret) {
            throw new UnauthorizedAccessError("Invalid reset token")
        }

        const tokenRecord = await this.repository.findPasswordResetTokenById(tokenId)

        if (!tokenRecord) {
            throw new UnauthorizedAccessError("Invalid reset token")
        }

        if (tokenRecord.used_at) {
            throw new UnauthorizedAccessError("Reset token already used")
        }

        if (tokenRecord.expires_at < new Date()) {
            throw new UnauthorizedAccessError("Reset token expired")
        }

        const isValid = await verifyPassword(tokenRecord.token_hash, tokenSecret)

        if (!isValid) {
            throw new UnauthorizedAccessError("Invalid reset token")
        }

        const user = await this.repository.findUserWithCredentialsById(tokenRecord.user_id)

        if (!user || !user.credentials) {
            throw new NotFoundError("User not found")
        }

        const passwordHash = await hashPassword(data.password)
        const consumedAt = new Date()

        await this.repository.updateUserPassword(user.id, passwordHash)
        await this.repository.markPasswordResetTokenUsed(tokenRecord.id, consumedAt)
        await this.repository.markPasswordResetTokensForUserUsed(user.id, consumedAt)
        await this.repository.revokeAllSessionsForUser(user.id, consumedAt)

        return {
            success: true
        }
    }
}