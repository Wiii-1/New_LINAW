import { AuthRepository  } from "./authRepository.js";
import { hashPassword, verifyPassword } from "./authPassword.js"
import { loginInput,signupInput, findById } from "./authValidator.js";
import { ConflictError, NotFoundError, UnauthorizedAccessError } from "../../shared/errors/appError.js";
import { randomUUID } from "node:crypto";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./authJWT.js";

export class AuthService {

    constructor ( private repository: AuthRepository ) {}
    
    async register (data: signupInput){

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
            tenant_id: tenant.tenant_id,
            first_name: data.first_name,
            last_name: data.last_name,
            job_title: data.job_title,
            email: data.email
        })
        
        await this.repository.createUserCredentials({
            user_id: user.id,
            password_hash
        })
        
        return user;
    }

    async login (data: loginInput) {

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
            user.credentials.password_hash,
            data.password
        )

        if (!isValid){
            throw new UnauthorizedAccessError("Wrong Password")
        }

        const session = 
            await this.repository.createSession({
                user_id: user.id,
                refreshTokenHash: " ",
                expiresAt
            })

        const refreshToken = generateRefreshToken({
            user_id: user.id,
            session_id: session.id
        })

        const refreshTokenHash = await hashPassword(refreshToken)

        await this.repository.updateSessionToken(
            session.id,
            refreshTokenHash
        )

        const accessToken = await generateAccessToken({
            user_id: user.id
        })

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

        const payload = verifyRefreshToken(refreshToken)

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

        const payload = verifyRefreshToken(refreshToken)

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

        const isValid = await verifyPassword(
            session.refreshTokenHash,
            refreshToken
        )

        if (!isValid) {
            throw new UnauthorizedAccessError(
                "Invalid refresh token"
            )
        }

        const newAccessToken = generateAccessToken({
            user_id: user.id
        })

        const newRefreshToken = generateRefreshToken({
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
}